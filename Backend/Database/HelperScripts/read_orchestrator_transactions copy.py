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

# Generate function selectors and map them to decoding functions
selector_to_decoder = {}


def get_function_selector(name, inputs):
    types = ",".join(inp["type"] for inp in inputs)
    signature = f"{name}({types})"
    return w3.keccak(text=signature).hex()[:10]


# General decoding functions for common data types
def decode_address(input_data):
    return decode(["address"], bytes.fromhex(input_data[:64]))[0]


def decode_uint256(input_data):
    return decode(["uint256"], bytes.fromhex(input_data[:64]))[0]


def decode_string(input_data):
    # Offset is given in the first 64 hex characters after the first 64 hex characters of the address
    offset = int(input_data[64:128], 16) * 2  # Convert byte offset to character index

    # Debug: Print calculated values
    print(f"Calculated offset in characters: {offset}")

    # String length starts at the offset, for 64 characters
    string_length_hex_start = offset
    string_length_hex_end = offset + 64
    length = int(input_data[string_length_hex_start:string_length_hex_end], 16)

    # Debug: Print calculated length
    print(f"String length from data: {length}")

    # Actual string data starts right after the length
    string_start = string_length_hex_end
    string_end = string_start + length * 2  # Each byte of string is 2 hex characters
    string_data = bytes.fromhex(input_data[string_start:string_end]).decode('utf-8')

    # Debug: Print the actual string data
    print(f"Decoded string: {string_data}")

    return string_data




def decode_address_array(input_data):
    offset = int(input_data[:64], 16) * 2
    array_length = int(input_data[offset : offset + 64], 16)
    addresses = []
    start = offset + 64
    for i in range(array_length):
        address = decode_address(input_data[start + i * 64 : start + (i + 1) * 64])
        addresses.append(address)
    return addresses


# For getUserEmail
def decode_get_user_email(input_data):
    wallet = decode_address(input_data[:64])
    return wallet


# For getLongestQueuingOffRampIntentAddress
def decode_get_longest_queuing_off_ramp_intent_address(input_data):
    excluded_addresses = decode_address_array(input_data)
    return excluded_addresses


# Decode function for each ABI function
def decode_register_user_account(input_data):
    address = decode_address(input_data[:64])
    email = decode_string(input_data[64:])
    return address, email


def decode_create_off_ramp_intent_and_send_eth(input_data):
    user = decode_address(input_data[:64])
    amount = decode_uint256(input_data[64:128])
    return user, amount


# For loginUserAccount
def decode_login_user_account(input_data):
    wallet = decode_address(input_data[:64])
    return wallet


# For onRamp
def decode_on_ramp(input_data):
    amount = decode_uint256(input_data[:64])
    off_ramper = decode_address(input_data[64:128])
    sender_email = decode_string(input_data[128:192])
    receiver_email = decode_string(input_data[192:256])
    transaction_amount = decode_uint256(input_data[256:320])
    return amount, off_ramper, sender_email, receiver_email, transaction_amount


# For releasePartialFundsToOnRamper
def decode_release_partial_funds_to_on_ramper(input_data):
    off_ramper = decode_address(input_data[:64])
    on_ramper = decode_address(input_data[64:128])
    release_amount = decode_uint256(input_data[128:192])
    return off_ramper, on_ramper, release_amount


# Define more decode functions as needed

# Mapping selectors to their respective functions
for func in contract_abi:
    if func["type"] == "function":
        selector = get_function_selector(func["name"], func["inputs"])
        if func["name"] == "registerUserAccount":
            selector_to_decoder[selector] = decode_register_user_account
        elif func["name"] == "createOffRampIntentAndSendETH":
            selector_to_decoder[selector] = decode_create_off_ramp_intent_and_send_eth
        # Add other functions similarly

# Example usage
tx_input = "0x3d8d1601000000000000000000000000a75da6945ca2311ac81165fc38706a1d612639af0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002362756c6b2d73622d312d7465737440627573696e6573732e6578616d706c652e636f6d"
func_selector = tx_input[:10]
encoded_params = tx_input[10:]
if func_selector in selector_to_decoder:
    result = selector_to_decoder[func_selector](encoded_params)
    print("Decoded Result:", result)
else:
    print("Function selector not recognized.")
