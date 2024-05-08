from web3 import Web3
import json
import os
from eth_abi import decode

# Establish connection
w3 = Web3(Web3.HTTPProvider("https://sepolia.era.zksync.dev"))
assert w3.is_connected(), "Failed to connect to the zkSync Sepolia testnet."

# Load ABI from file
script_directory = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_directory, "Orchestrator_zksync.json")
with open(file_path, "r") as file:
    data = json.load(file)
contract_abi = data["contracts"]["src/Orchestrator.sol"]["Orchestrator"]["abi"]

# Utility function to generate function selectors
def get_function_selector(function_abi):
    name = function_abi['name']
    types = ','.join(inp['type'] for inp in function_abi['inputs'])
    signature = f"{name}({types})"
    return w3.keccak(text=signature).hex()[:10]

# General function to decode inputs
def decode_inputs(types, input_data):
    # Converts hex input data to bytes and decodes according to the specified types
    return decode(types, bytes.fromhex(input_data))

# Define decoding functions for each ABI function with dynamic input handling
def decode_function_input(func_abi, input_data):
    types = [input['type'] for input in func_abi['inputs']]
    return decode_inputs(types, input_data)

# Decode function for 'registerUserAccount'
def decode_register_user_account(input_data):
    # Assuming input_data already has the selector removed
    address = decode_single("address", bytes.fromhex(input_data[:64]))
    offset = int(input_data[64:128], 16) * 2  # offset in characters
    string_length = int(input_data[offset : offset + 64], 16)
    email = bytes.fromhex(
        input_data[offset + 64 : offset + 64 + string_length * 2]
    ).decode("utf-8")
    return address, email
selector_to_decoder = {}

# Map each function in ABI to a decoding function
for func in contract_abi:
    if func["type"] == "function":
        selector = get_function_selector(func)
        selector_to_decoder[selector] = lambda data, func_abi=func: decode_function_input(func_abi, data)

# Example usage
tx_input = "0x3d8d1601000000000000000000000000a75da6945ca2311ac81165fc38706a1d612639af0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002362756c6b2d73622d312d7465737440627573696e6573732e6578616d706c652e636f6d"
func_selector = tx_input[:10]
encoded_params = tx_input[10:]
if func_selector in selector_to_decoder:
    if func_selector == "registerUserAccount"
    result = selector_to_decoder[func_selector](encoded_params)
    print("Decoded Result:", result)
else:
    print("Function selector not recognized.")
