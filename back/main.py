from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3
from dotenv import load_dotenv
import os
import json
import aiohttp
from eth_utils import keccak

load_dotenv()
REGISTRAR_CONTRACT_ADDRESS = "0x30afcf8bddd96b3e2b0210f8f003aafd4a52f628"
REGISTRY_CONTRACT_ADDRESS = "0x2565b1f8bfd174d3acb67fd1a377b8014350dc26"

code_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(code_dir, "abis/registrar.json"), "r") as abi_file:
    REGISTRAR_CONTRACT_ABI = json.load(abi_file)
with open(os.path.join(code_dir, "abis/registry.json"), "r") as abi_file:
    REGISTRY_CONTRACT_ABI = json.load(abi_file)

PRIVATE_KEY = os.getenv("BEDROCK_PRIVATE_KEY")
PINATA_JWT = os.getenv("PINATA_JWT")
BASE_RPC_URL = os.getenv("BASE_RPC_URL", "https://mainnet.base.org")

w3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)
registrar_contract = w3.eth.contract(address=Web3.to_checksum_address(REGISTRAR_CONTRACT_ADDRESS), abi=REGISTRAR_CONTRACT_ABI)
registry_contract = w3.eth.contract(address=Web3.to_checksum_address(REGISTRY_CONTRACT_ADDRESS), abi=REGISTRY_CONTRACT_ABI)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def namehash(name: str) -> bytes:
    """
    Implements the ENS namehash algorithm.
    See: https://eips.ethereum.org/EIPS/eip-137
    """
    node = b'\x00' * 32
    if name:
        labels = name.split('.')
        for label in reversed(labels):
            label_hash = keccak(text=label)
            node = keccak(node + label_hash)
    return node  # returns 32-byte hash

class RegisterRequest(BaseModel):
    username: str
    address: str

class CheckUsernameAvailableResponse(BaseModel):
    username: str
    available: bool

class GetUsernameResponse(BaseModel):
    username: str

class GetAddressResponse(BaseModel):
    address: str

class TransactionResponse(BaseModel):
    tx_hash: str

@app.post("/register", description="Register an ENS subname")
def register_username(req: RegisterRequest) -> TransactionResponse:
    try:
        nonce = w3.eth.get_transaction_count(account.address)
        txn = registrar_contract.functions.register(req.username, Web3.to_checksum_address(req.address)).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": w3.eth.gas_price,
            "chainId": w3.eth.chain_id,
        })

        signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        return TransactionResponse(tx_hash=tx_hash.hex())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/available", description="Check if an ENS subname is available")
def check_username_available(username: str = Query(..., min_length=1)) -> CheckUsernameAvailableResponse:
    try:
        is_available = registrar_contract.functions.available(username).call()
        return CheckUsernameAvailableResponse(username=username, available=is_available)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/{address}", description="Get the ENS subname of an address")
def get_username(address: str) -> GetUsernameResponse:
    try:
        result = registrar_contract.functions.getUsername(Web3.to_checksum_address(address)).call()
        return GetUsernameResponse(username=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/username/{username}/address", description="Get the address of a username using the registry contract")
def get_address(username: str) -> GetAddressResponse:
    try:
        node = namehash(f"{username}.bedrock-app.eth")
        address = registry_contract.functions.addr(node).call()
        return GetAddressResponse(address=address)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/username/{username}/avatar", description="Get the avatar URL of a username")
async def get_avatar(username: str) -> str:
    try:
        node = namehash(f"{username}.bedrock-app.eth")

        avatar_url = registry_contract.functions.text(node, "avatar").call()
        if avatar_url:
            return avatar_url
        else:
            # Fallback URL if avatar not set
            return f"https://avatars.jakerunzer.com/{username}"

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get avatar: {str(e)}")


@app.post("/username/{username}/avatar", description="Create or update the avatar of a user (using ENS text records)")
async def change_avatar(username: str, file: UploadFile = File(...)) -> TransactionResponse:
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    data = aiohttp.FormData()
    data.add_field(
        name="file",
        value=await file.read(),  # Read file contents
        filename=file.filename,
        content_type=file.content_type,
    )

    headers = {
        "Authorization": f"Bearer {PINATA_JWT}",
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, data=data, headers=headers) as response:
            response.raise_for_status()
            result = await response.json()
            image_url = f"https://gateway.pinata.cloud/ipfs/{result.get('IpfsHash')}"


    try:
        nonce = w3.eth.get_transaction_count(account.address)
        txn = registrar_contract.functions.setText(
            namehash(f"{username}.bedrock-app.eth"),            # label
            "avatar",                      # key
            image_url                      # value
        ).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": w3.eth.gas_price,
            "chainId": w3.eth.chain_id,
        })

        signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        return TransactionResponse(tx_hash=tx_hash.hex())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
