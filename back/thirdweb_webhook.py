import hashlib
import hmac
import os
import time
from typing import Any, Dict, Literal

from aleph.sdk import AuthenticatedAlephHttpClient
from aleph.sdk.chains.ethereum import ETHAccount
from dotenv import load_dotenv
from fastapi import HTTPException, Header, Request
from pydantic import BaseModel, Field
from web3 import Web3

load_dotenv()

# Configuration
THIRDWEB_WEBHOOK_SECRET = os.getenv("THIRDWEB_WEBHOOK_SECRET", "")
PAYMENT_PROCESSOR_ADDRESS = os.getenv("PAYMENT_PROCESSOR_ADDRESS", "")
ALEPH_PRIVATE_KEY: bytes = os.getenv(  # type: ignore
    "ALEPH_PRIVATE_KEY",
    os.getenv("BEDROCK_PRIVATE_KEY"),  # type: ignore
)

# Maximum age of webhook in seconds before rejecting it (5 minutes)
MAX_WEBHOOK_AGE = 300

# Initialize Aleph client
aleph_account = ETHAccount(ALEPH_PRIVATE_KEY)


# Models
class ThirdwebTransactionDetails(BaseModel):
    transactionHash: str
    amountWei: str
    amount: str
    amountUSDCents: int
    completedAt: str


class ThirdwebPurchaseData(BaseModel):
    userAddress: str


class ThirdwebBuyWithCryptoWebhook(BaseModel):
    swapType: str
    source: ThirdwebTransactionDetails
    status: Literal["COMPLETED", "PENDING"]
    toAddress: str
    destination: ThirdwebTransactionDetails | None = None
    purchaseData: ThirdwebPurchaseData


class ThirdwebWebhookPayload(BaseModel):
    data: Dict[str, Any] = Field(...)

    @property
    def buy_with_crypto_status(self) -> ThirdwebBuyWithCryptoWebhook | None:
        if "buyWithCryptoStatus" in self.data:
            return ThirdwebBuyWithCryptoWebhook(**self.data["buyWithCryptoStatus"])
        return None


# Aleph functions
async def get_credit_balance(address: str) -> float:
    """Get credit balance for an address from Aleph aggregate"""
    try:
        async with AuthenticatedAlephHttpClient(
            account=aleph_account,
        ) as client:
            response = await client.fetch_aggregate(
                address=aleph_account.get_address(), key="BEDROCK_CREDIT_BALANCES"
            )
        return response.get(address, 0.0)
    except Exception:
        return 0.0


async def update_credit_balance(address: str, amount: float) -> None:
    """Update credit balance for an address on Aleph aggregate"""
    try:
        async with AuthenticatedAlephHttpClient(
            account=aleph_account,
        ) as client:
            current_balances = {}
            try:
                response = await client.fetch_aggregate(
                    address=aleph_account.get_address(), key="BEDROCK_CREDIT_BALANCES"
                )
                if response.get("credit_balances"):
                    current_balances = response["credit_balances"]
            except Exception:
                pass

            # Update balance
            current_balance = current_balances.get(address, 0.0)
            new_balance = current_balance + amount
            current_balances[address] = new_balance

            # Post updated balances to Aleph
            await client.create_aggregate(
                key="BEDROCK_CREDIT_BALANCES",
                content=current_balances,
            )
    except Exception as e:
        print(f"Error updating credit balance: {e}")
        raise


# Webhook endpoint
async def thirdweb_webhook(
    request: Request,
    payload: ThirdwebWebhookPayload,
    signature: str = Header(None, alias="X-Pay-Signature"),
    timestamp: str = Header(None, alias="X-Pay-Timestamp"),
) -> Dict[str, Any]:
    """
    Process webhooks from Thirdweb.
    Currently only supports buyWithCryptoStatus events.

    Verifies the webhook signature using the THIRDWEB_WEBHOOK_SECRET and validates
    the timestamp to prevent replay attacks.
    """
    # Verify the webhook signature
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    # Check timestamp to prevent replay attacks
    if not timestamp:
        raise HTTPException(status_code=401, detail="Missing timestamp")

    try:
        webhook_timestamp = int(timestamp)
        current_time = int(time.time())

        # Check if webhook is too old
        if current_time - webhook_timestamp > MAX_WEBHOOK_AGE:
            raise HTTPException(status_code=401, detail="Webhook expired")

        # Check if webhook is from the future (with a small tolerance)
        if webhook_timestamp > current_time + 30:
            raise HTTPException(status_code=401, detail="Invalid timestamp")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid timestamp format")

    # Get raw request body for signature verification
    body = await request.body()
    body_str = body.decode("utf-8")

    # Combine timestamp and body to create the payload for signature verification
    signature_payload = f"{timestamp}.{body_str}"

    # Calculate expected signature
    expected_signature = hmac.new(
        THIRDWEB_WEBHOOK_SECRET.encode(), signature_payload.encode(), hashlib.sha256
    ).hexdigest()

    # Secure comparison to prevent timing attacks
    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    data = payload.buy_with_crypto_status
    if data is None:
        raise HTTPException(status_code=400, detail="Unsupported webhook type")

    if data.destination is None:
        return {"status": "ignored", "reason": "No destination"}

    if Web3.to_checksum_address(data.toAddress) != Web3.to_checksum_address(
        PAYMENT_PROCESSOR_ADDRESS
    ):
        return {
            "status": "ignored",
            "reason": "Transaction not for Bedrock payment address",
        }

    try:
        # Extract transaction details
        transaction_hash = data.source.transactionHash
        sender_address = Web3.to_checksum_address(data.purchaseData.userAddress)

        # Convert amount from cents to dollars
        amount_usd = data.destination.amountUSDCents / 100

        # Only process completed transactions
        if data.status == "COMPLETED":
            # Update credit balance on Aleph
            await update_credit_balance(sender_address, amount_usd)

            return {
                "status": "success",
                "transaction_hash": transaction_hash,
                "address": sender_address,
                "amount": amount_usd,
            }
        else:
            return {
                "status": "pending",
                "transaction_hash": transaction_hash,
                "address": sender_address,
                "amount": amount_usd,
            }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing webhook: {str(e)}"
        )


# Credits endpoint
async def get_credits(address: str) -> Dict[str, Any]:
    """Get credit balance for an address"""
    try:
        checksum_address = Web3.to_checksum_address(address)
        balance = await get_credit_balance(checksum_address)
        return {"address": checksum_address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting credits: {str(e)}")


async def add_credits_direct(address: str, amount: float) -> Dict[str, Any]:
    """Add credits directly to an address balance"""
    try:
        checksum_address = Web3.to_checksum_address(address)
        await update_credit_balance(checksum_address, amount)
        new_balance = await get_credit_balance(checksum_address)
        return {
            "address": checksum_address,
            "amount_added": amount,
            "new_balance": new_balance,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding credits: {str(e)}")
