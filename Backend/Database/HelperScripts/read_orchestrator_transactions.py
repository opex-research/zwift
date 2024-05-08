from web3 import Web3
import json
from eth_abi import decode  
import os
w3 = Web3(Web3.HTTPProvider('https://sepolia.era.zksync.dev'))

# Ensure that the connection is successful
if w3.is_connected():
    print("Connected to zkSync Sepolia testnet.")
else:
    print("Failed to connect to the zkSync Sepolia testnet.")


# Get the directory where the script is located
script_directory = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the JSON file in the same directory as the script
file_path = os.path.join(script_directory, "Orchestrator_zksync.json")

# Load the ABI from the JSON file
with open(file_path, 'r') as file:
    data = json.load(file)
contract_abi = data["contracts"]["src/Orchestrator.sol"]["Orchestrator"]["abi"]

# Contract address (replace with the actual address if different)
contract_address = '0x6f74F759715DFA0f323af0e2326E787D599FD42a'

# Create the contract instance with Web3
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Example transaction input data
tx_input = '0x3d8d1601000000000000000000000000a75da6945ca2311ac81165fc38706a1d612639af0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002362756c6b2d73622d312d7465737440627573696e6573732e6578616d706c652e636f6d'

# Decode the transaction input data
def decode_tx_input(tx_input):
    func_selector = tx_input[:10]
    encoded_params = tx_input[10:]
    func_abi = next((item for item in contract_abi if item['type'] == 'function' and func_selector == w3.keccak(text=f"{item['name']}({','.join([inp['type'] for inp in item['inputs']])})").hex()[:10]), None)
    print("Function ABI:", func_abi)
    if func_abi:
        param_types = [input['type'] for input in func_abi['inputs']]
        print("Parameter types:", param_types)
        try:
            decoded_params = decode(param_types, bytes.fromhex(encoded_params))
            return func_abi['name'], decoded_params
        except Exception as e:
            print("Error decoding parameters:", str(e))
            return func_abi['name'], 'Error decoding parameters'
    return None, 'Function not found'

function_name, params = decode_tx_input(tx_input)
print("Function called:", function_name)
print("Parameters:", params)


function_name, params = decode_tx_input(tx_input)

print("Function called:", function_name)
print("Parameters:", params)
