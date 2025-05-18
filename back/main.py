from fastapi import FastAPI, HTTPException
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

class RegisterRequest(BaseModel):
    username: str
    address: str

@app.post("/register")
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
        return {"tx_hash": tx_hash.hex()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/username/{address}")
def get_username(address: str):
    try:
        result = contract.functions.getUsername(Web3.to_checksum_address(address)).call()
        return {"username": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
