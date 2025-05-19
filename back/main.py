from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3
from dotenv import load_dotenv
import os
import json

load_dotenv()
CONTRACT_ADDRESS = "0x30afcf8bddd96b3e2b0210f8f003aafd4a52f628"

code_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(code_dir, "abis/registrar.json"), "r") as abi_file:
    CONTRACT_ABI = json.load(abi_file)

PRIVATE_KEY = os.getenv("BEDROCK_PRIVATE_KEY")
BASE_RPC_URL = "https://mainnet.base.org"

w3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterRequest(BaseModel):
    username: str
    address: str

class CheckUsernameAvailableResponse(BaseModel):
    username: str
    available: bool

class GetUsernameResponse(BaseModel):
    username: str

class RegisterUsernameResponse(BaseModel):
    tx_hash: str

@app.post("/register", description="Register an ENS subname")
def register_username(req: RegisterRequest):
    try:
        nonce = w3.eth.get_transaction_count(account.address)
        txn = contract.functions.register(req.username, Web3.to_checksum_address(req.address)).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": w3.eth.gas_price,
            "chainId": w3.eth.chain_id,
        })

        signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        return RegisterUsernameResponse(tx_hash=tx_hash.hex())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/available", description="Check if an ENS subname is available")
def check_username_available(username: str = Query(..., min_length=1)) -> CheckUsernameAvailableResponse:
    try:
        is_available = contract.functions.available(username).call()
        return CheckUsernameAvailableResponse(username=username, available=is_available)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/{address}", description="Get the ENS subname of an address")
def get_username(address: str) -> GetUsernameResponse:
    try:
        result = contract.functions.getUsername(Web3.to_checksum_address(address)).call()
        return GetUsernameResponse(username=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
