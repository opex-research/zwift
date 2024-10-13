// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Registrator.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OffRamper is Ownable, ReentrancyGuard {
    IERC20 public token;
    Registrator public registrator;

    uint256 public intentExpirationPeriod = 1 days;

    struct Intent {
        uint256 amount;
        uint256 timestamp;
        address onRamperAddress;
        bool isActive;
    }

    mapping(address => uint256) private escrowBalances;
    mapping(address => Intent[]) private offRamperIntents;

    /* ============ Events ============ */
    // Intent is created by the off-ramper
    // TODO: Change to only emit the hash of the paypal email`
    // NOTE: Timestamp is not emitted as it is equal to block.timestamp --> Redundant
    event OffRampIntentCreated(
        uint256 indexed offRampIntentID,
        address indexed user,
        string paypalEmail,
        uint256 offRampAmount,
        uint256 conversionRate
    );
    // Intent is cancelled by the off-ramper
    event OffRampIntentCancelled(
        uint256 indexed offRampIntentID,
        address indexed user,
        uint256 offRampAmount
    );
    // Intent is refunded to the off-ramper
    // This is emitted once the intent has been refunded upon cancellation.
    event OffRampIntentRefunded(
        uint256 indexed offRampIntentID,
        address indexed user,
        uint256 offRampAmount
    );
    // Intent is fulfilled by the on-ramper, escrow released to the on-ramper address, signature verified
    // NOTE: Address to send funds to can be different from the on-ramper address!
    event OnRampIntentVerified(
        uint256 indexed offRampIntentID,
        address indexed offRamperAddress,
        address indexed onRamperAddress,
        address to,
        uint256 amount,
        uint256 feeAmount
    );

    // Emitted when the minimum deposit amount is set
    event MinDepositAmountSet(uint256 minDepositAmount);
    // Emitted when the maximum on-ramp amount is set
    event MaxOnRampAmountSet(uint256 maxOnRampAmount);
    // Emitted when the on-ramp cooldown period is set
    event OnRampCooldownPeriodSet(uint256 onRampCooldownPeriod);

    /* ============ Structs ============ */
    struct OffRampIntent {
        address offRamperAddress;
        string paypalEmail;
        address verifierSigningKey;         
        bytes32 notaryKeyHash;              // Hash of notary's public key
        uint256 offRampAmount;              // Amount of USDC deposited
        bytes32 receiveCurrencyId;          // Id of the currency to be received off-chain (bytes32(currency code))
        uint256 remainingDeposits;          // Amount of remaining deposited liquidity
        uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
        uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
        bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
    }

    /* ============ Modifiers ============ */
    // TODO: isRegistered function is not implemented in the Registrator contract so far!
    modifier onlyRegisteredUser() {
        require(
            
            registrator.isRegistered(msg.sender),
            "You need to register first"
        );
        _;
    }

    /* ============ Constants ============ */
    uint256 internal constant PRECISE_UNIT = 1e18;      // Allows for precise arithmetic operations by expanding the number of decimal places
    uint256 internal constant MAX_DEPOSITS = 5;         // An account can only have max 5 different deposit parameterizations to prevent locking funds
    uint256 constant MAX_SUSTAINABILITY_FEE = 5e16;     // 5% max sustainability fee

    /* ============ State Variables ============ */
    IERC20 public immutable usdc;                                   // USDC token contract
    IPayPalAccountRegistry public registrator;                      // Account Registry contract for PayPal
    IOnRampProcessor public onRampProcessor;                        // Address of the processor contract to verify notarizations

    bool public isInitialized;                                      // Indicates if contract has been initialized

    uint256 public minDepositAmount;                                // Minimum amount of USDC that can be deposited
    uint256 public maxOnRampAmount;                                 // Maximum amount of USDC that can be on-ramped in a single transaction
    uint256 public onRampCooldownPeriod;                            // Time period that must elapse between completing an on-ramp and signaling a new intent
    uint256 public sustainabilityFee;                               // Fee charged to on-rampers in preciseUnits (1e16 = 1%)
    address public sustainabilityFeeRecipient;                      // Address that receives the sustainability fee

    /* ============ Constructor ============ */
    // Ensures:
    // - Ownable contract is a widely used pattern in Solidity that provides a basic access control mechanism, 
    //   where an owner account is granted exclusive access to specific functions. In this case, the owner is the 
    //   contract deployer. Only the owner can transfer ownership.
    // - Min and max deposit amounts are set
    // - Intent expiration period is set (How long offboard exists before it is refunded)
    // - On-ramp cooldown period is set (How long onboard must wait before it can be used again)
    // - Sustainability fee and recipient are set
    constructor(
        address _owner,
        IERC20 _usdc,
        uint256 _minDepositAmount,
        uint256 _maxOnRampAmount,
        uint256 _intentExpirationPeriod,
        uint256 _onRampCooldownPeriod,
        uint256 _sustainabilityFee,
        address _sustainabilityFeeRecipient
    )
        Ownable()
    {
        usdc = _usdc;
        minDepositAmount = _minDepositAmount;
        maxOnRampAmount = _maxOnRampAmount;
        intentExpirationPeriod = _intentExpirationPeriod;
        onRampCooldownPeriod = _onRampCooldownPeriod;
        sustainabilityFee = _sustainabilityFee;
        sustainabilityFeeRecipient = _sustainabilityFeeRecipient;

        transferOwnership(_owner);
    }

    /* ============ External Functions ============ */
    /**
    * @notice Initialize Ramp with the addresses of the Processors. Needed to set the addresses of the Registrator and OnRampProcessor contracts, which may not be known at the time of deployment.
    *
    * @param _reg     Account Registry contract for Revolut
    * @param _sendProcessor       Send processor address
    */
    function initialize(
        IRevolutAccountRegistry _registrator,
        IRevolutSendProcessor _onRampProcessor
    )
        external
        onlyOwner
    {
        require(!isInitialized, "Already initialized");

        registrator = _registrator;
        sendProcessor = _onRampProcessor;

        isInitialized = true;
    }

    // TODO: Needs expansion regarding logic. Currently insecure.
    function newOffRampIntent(
        string calldata _paypalID,
        uint256 _depositAmount,
        uint256 _receiveAmount,
        address _verifierSigningKey,
        bytes32 _notaryKeyHash
        )
        external
        onlyRegisteredUser 
    {
        require(token.transferFrom(msg.sender, address(this), amount),"Token transfer failed");
        require(_depositAmount >= minDepositAmount, "Deposit amount must be greater than min deposit amount");
        escrowBalances[msg.sender] += amount;
        offRamperIntents[msg.sender].push(
            Intent({
                amount: amount,
                timestamp: block.timestamp,
                onRamperAddress: address(0),
                isActive: true
            })
        );
        emit OffRampIntentCreated(msg.sender, amount, block.timestamp);
    }

    // NOTE:Signal OnRamping Intent --> Is done in the centralized server for now. Maintains persistent state.

    // Function: OnRamp 
    // TODO:Needs to:
    // - Verify the signature provided by the on-ramper
    //   -  This can be done with isValidSignatureNow through the following import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";














    function acceptIntent(address offRamperAddress, uint256 intentIndex)
        external
        onlyRegisteredUser
    {
        Intent storage intent = offRamperIntents[offRamperAddress][intentIndex];
        require(intent.isActive, "Intent is not active");
        require(
            intent.onRamperAddress == address(0),
            "Intent already accepted"
        );
        intent.onRamperAddress = msg.sender;
        emit IntentAccepted(offRamperAddress, msg.sender, intent.amount, block.timestamp);
    }

    function requestReleaseOfFunds(
        address offRamperAddress,
        uint256 intentIndex,
        bytes calldata proofOfPayment
    ) external nonReentrant onlyRegisteredUser {
        Intent storage intent = offRamperIntents[offRamperAddress][intentIndex];
        require(intent.isActive, "Intent is not active");
        require(
            intent.onRamperAddress == msg.sender,
            "Not authorized"
        );
        // Implement your proof verification logic
        bool isValid = verifyProof(proofOfPayment);
        require(isValid, "Invalid proof of payment");
        intent.isActive = false;
        escrowBalances[offRamperAddress] -= intent.amount;
        require(
            token.transfer(msg.sender, intent.amount),
            "Token transfer failed"
        );
        emit FundsReleased(offRamperAddress, msg.sender, intent.amount, block.timestamp);
    }

    function cancelIntent(uint256 intentIndex) external onlyRegisteredUser {
        Intent storage intent = offRamperIntents[msg.sender][intentIndex];
        require(intent.isActive, "Intent is not active");
        require(
            intent.onRamperAddress == address(0),
            "Intent already accepted"
        );
        intent.isActive = false;
        escrowBalances[msg.sender] -= intent.amount;
        require(
            token.transfer(msg.sender, intent.amount),
            "Token transfer failed"
        );
        emit IntentCancelled(msg.sender, intent.amount, block.timestamp);
    }

    function refundEscrowBalance() external nonReentrant onlyRegisteredUser {
        uint256 refundAmount = escrowBalances[msg.sender];
        require(refundAmount > 0, "No funds to refund");
        escrowBalances[msg.sender] = 0;
        require(
            token.transfer(msg.sender, refundAmount),
            "Token transfer failed"
        );
        emit EscrowRefunded(msg.sender, refundAmount, block.timestamp);
    }

    function pruneExpiredIntents() external onlyRegisteredUser {
        Intent[] storage intents = offRamperIntents[msg.sender];
        for (uint256 i = 0; i < intents.length; i++) {
            if (
                intents[i].isActive &&
                (block.timestamp - intents[i].timestamp) >= intentExpirationPeriod &&
                intents[i].onRamperAddress == address(0)
            ) {
                intents[i].isActive = false;
                escrowBalances[msg.sender] -= intents[i].amount;
                require(
                    token.transfer(msg.sender, intents[i].amount),
                    "Token transfer failed"
                );
                emit IntentExpired(msg.sender, intents[i].amount, block.timestamp);
            }
        }
    }

    function setIntentExpirationPeriod(uint256 _period) external onlyOwner {
        intentExpirationPeriod = _period;
        emit IntentExpirationPeriodSet(_period);
    }

    function verifyProof(bytes calldata proof) internal view returns (bool) {
        // Implement your proof verification logic here
        return true; // Placeholder
    }

    // Additional helper functions and getters can be added as needed
}