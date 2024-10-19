// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;



import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import { SafeERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

import { Uint256ArrayUtils } from "../external/Uint256ArrayUtils.sol";
import { IPaymentVerifier } from "./interfaces/IPayPalPaymentVerifier.sol";
import { IPayPalRegistrator } from "/interfaces/IPayPalRegistrator.sol";

contract Ramp is Ownable, ReentrancyGuard {
    using Uint256ArrayUtils for uint256[];
    using SafeERC20 for IERC20;

    /* ============ Events ============ */
    // Existing Events
    event OffRampIntentCreated(
        uint256 indexed offRampIntentID,
        address indexed user,
        string paypalID,
        uint256 offRampAmount,
        uint256 conversionRate
    );
    event OffRampIntentRefunded(
        uint256 indexed offRampIntentID,
        address indexed user,
        uint256 offRampAmount
    );
    event OnRampIntentVerified(
        uint256 indexed offRampIntentID,
        address indexed offRamperAddress,
        address indexed onRamperAddress,
        address to,
        uint256 amount,
        uint256 feeAmount
    );

    // Additional Events for Timelock
    event CancellationQueued(
        bytes32 indexed cancellationId,
        uint256 indexed offRampIntentID,
        address indexed user,
        uint256 executeAt
    );
    event CancellationExecuted(
        bytes32 indexed cancellationId,
        uint256 indexed offRampIntentID,
        address indexed user,
        uint256 amount
    );
    event CancellationCancelled(
        bytes32 indexed cancellationId,
        uint256 indexed offRampIntentID,
        address indexed user
    );

    // Event for setting parameters
    event MinDepositAmountSet(uint256 minDepositAmount);
    event MaxOnRampAmountSet(uint256 maxOnRampAmount);
    event OnRampCooldownPeriodSet(uint256 onRampCooldownPeriod);
    event SustainabilityFeeSet(uint256 sustainabilityFee);
    event SustainabilityFeeRecipientSet(address sustainabilityFeeRecipient);

    /* ============ Structs ============ */
    struct OffRampIntent {
        address offRamperAddress;
        string paypalID;
        address verifierSigningKey;         
        bytes32 notaryKeyHash;              
        uint256 offRampAmount;              
        bytes32 receiveCurrencyId;          
       // uint256 remainingDeposits; //Sören: not needed, since we only target the whole depostit amount         
        uint256 conversionRate;             
        uint256 createdAt;                  // Timestamp when the intent was created
    }

    struct Cancellation {
        uint256 offRampIntentID;
        address user;
        uint256 amount;
        uint256 executeAt; // Timestamp when cancellation can be executed
        bool executed;
    }

    /* ============ Modifiers ============ */
    modifier onlyRegisteredUser() {
        require(
            payPalRegistrator.isRegistered(msg.sender),
            "You need to register first"
        );
        _;
    }

    /* ============ Constants ============ */
    uint256 internal constant PRECISE_UNIT = 1e18;      // Allows for precise arithmetic operations by expanding the number of decimal places
    uint256 internal constant MAX_DEPOSITS = 5;        // An account can only have max 5 different deposit parameterizations to prevent locking funds
    uint256 constant MAX_SUSTAINABILITY_FEE = 5e16;     // 5% max sustainability fee
    uint256 public intentExpirationPeriod = 1 days;

    // Timelock Constants
    uint256 public constant MIN_DELAY = 10 minutes;     // Minimum delay for cancellation
    uint256 public constant MAX_DELAY = 1 days;         // Maximum allowed delay
    uint256 public constant GRACE_PERIOD = 2 days;      // Grace period for executing cancellation after delay

    /* ============ State Variables ============ */
    IERC20 public token;                                            // USDC token contract
    IPayPalRegistrator public payPalRegistrator;                    // Account Registry contract for PayPal
    IPayPalPaymentVerifier public payPalPaymentVerifier;            // Address of the payment verifier contract to verify notarizations

    bool public isInitialized;                                      // Indicates if contract has been initialized

    uint256 public minDepositAmount;                                // Minimum amount of USDC that can be deposited
    uint256 public maxOnRampAmount;                                 // Maximum amount of USDC that can be on-ramped in a single transaction
    uint256 public onRampCooldownPeriod;                            // Time period that must elapse between completing an on-ramp and signaling a new intent
    uint256 public sustainabilityFee;                               // Fee charged to on-ramper in preciseUnits (1e16 = 1%)
    address public sustainabilityFeeRecipient;                      // Address that receives the sustainability fee

    uint256 public offRampIntentCounter;                            // Counter for offRampIntent IDs

    mapping(uint256 => OffRampIntent) public offRamperIntents;

    // Timelock Mappings
    mapping(bytes32 => bool) public queuedCancellations;            // Tracks if a cancellation is queued
    mapping(bytes32 => Cancellation) public cancellations;          // Details of each cancellation

    /* ============ Constructor ============ */
    constructor(
        address _owner,
        IERC20 _usdc,
        uint256 _minDepositAmount,
        uint256 _maxOnRampAmount,
        uint256 _intentExpirationPeriod,
        uint256 _onRampCooldownPeriod,
        uint256 _sustainabilityFee,
        address _sustainabilityFeeRecipient
    ) Ownable(_owner) {
        require(_owner != address(0), "Owner address cannot be zero");
        require(address(_usdc) != address(0), "USDC address cannot be zero");
        require(_sustainabilityFee <= MAX_SUSTAINABILITY_FEE, "Sustainability fee exceeds maximum");

        token = _usdc;
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
     * @param _payPalRegistrator           Account Registry contract for PayPal, registers PayPal IDs
     * @param _paymentVerifier       Processor contract address to verify notarizations
     */
    function initialize(
        IPayPalRegistrator _payPalRegistrator,
        IPaymentVerifier _payPalPaymentVerifier
    )
        external
        onlyOwner
    {
        require(!isInitialized, "Already initialized");
        require(address(_payPalRegistrator) != address(0), "Registrator address cannot be zero");
        require(address(_payPalPaymentVerifier) != address(0), "PayPalPaymentVerifier address cannot be zero");

        payPalRegistrator = _payPalRegistrator;
        payPalPaymentVerifier = _payPalPaymentVerifier;

        isInitialized = true;
    }

    /**
     * @notice Create a new offRamp intent. Only registered users can create offramp intents (enforced by modifier).
     * @param _paypalID           PayPal ID of the user
     * @param _depositAmount      Amount of USDC to deposit
     * @param _receiveAmount      Amount of currency to receive off-chain
     * @param _verifierSigningKey Verifier's signing key
     * @param _notaryKeyHash      Hash of notary's public key
     */
    function newOffRampIntent(
        string calldata _paypalID,
        uint256 _depositAmount,
        uint256 _receiveAmount,
        address _verifierSigningKey,
        bytes32 _notaryKeyHash
    ) external onlyRegisteredUser {
        bytes32 offRamperId = payPalRegistrator.getEmail(msg.sender);
        require(keccak256(abi.encode(_paypalID)) == offRamperId, "Submitted PayPal ID must match the registered ID");
       // require(offRampIntentCounter < MAX_DEPOSITS, "Maximum deposit amount reached");
        require(_depositAmount >= minDepositAmount, "Deposit amount must be greater than min deposit amount");
        require(_receiveAmount > 0, "Receive amount must be greater than 0");

        uint256 conversionRate = (_depositAmount * PRECISE_UNIT) / _receiveAmount;
        uint256 offRampIntentID = offRampIntentCounter++;

        offRamperIntents[offRampIntentID] = OffRampIntent({
            offRamperAddress: msg.sender,
            paypalID: _paypalID,
            verifierSigningKey: _verifierSigningKey,
            notaryKeyHash: _notaryKeyHash,
            offRampAmount: _depositAmount,
            receiveCurrencyId: bytes32(0),  // Assuming this needs to be set appropriately
            //remainingDeposits: _depositAmount,
            conversionRate: conversionRate,
            createdAt: block.timestamp
        });

        token.safeTransferFrom(msg.sender, address(this), _depositAmount);

        emit OffRampIntentCreated(offRampIntentID, msg.sender, _paypalID, _depositAmount, conversionRate);
    }

    /**
     * @notice Queue a cancellation for an offRamp intent. This will allow the user to execute the cancellation after a 10-minute delay.
     * @param _offRampIntentID   The ID of the offRamp intent to cancel
     */
    function queueCancellation(uint256 _offRampIntentID) external onlyRegisteredUser {
        OffRampIntent storage intent = offRamperIntents[_offRampIntentID];
        require(intent.offRamperAddress == msg.sender, "Sender must be the depositor");
        //require(intent.remainingDeposits > 0, "No deposits to withdraw");

        // Generate a unique cancellation ID
        bytes32 cancellationId = getCancellationId(_offRampIntentID, msg.sender, block.timestamp);

        require(!queuedCancellations[cancellationId], "Cancellation already queued");

        uint256 executeAt = block.timestamp + MIN_DELAY;
        require(executeAt <= block.timestamp + MAX_DELAY, "Execute time exceeds maximum delay");

        // Queue the cancellation
        queuedCancellations[cancellationId] = true;
        cancellations[cancellationId] = Cancellation({
            offRampIntentID: _offRampIntentID,
            user: msg.sender,
            amount: intent.offRampAmount,
            executeAt: executeAt,
            executed: false
        });

        emit CancellationQueued(cancellationId, _offRampIntentID, msg.sender, executeAt);
    }

    /**
     * @notice Execute a queued cancellation after the timelock period has passed
     * @param _cancellationId    The unique ID of the cancellation to execute
     */
    function executeCancellation(bytes32 _cancellationId) external nonReentrant {
        Cancellation storage cancellation = cancellations[_cancellationId];
        require(cancellation.user == msg.sender, "Only the user can execute their cancellation");
        require(queuedCancellations[_cancellationId], "Cancellation is not queued");
        require(!cancellation.executed, "Cancellation already executed");
        require(block.timestamp >= cancellation.executeAt, "Timelock not yet expired");
        require(block.timestamp <= cancellation.executeAt + GRACE_PERIOD, "Timelock period expired");

        // Mark as executed
        cancellation.executed = true;
        queuedCancellations[_cancellationId] = false;

        // Retrieve intent
        OffRampIntent storage intent = offRamperIntents[cancellation.offRampIntentID];
        uint256 refundAmount = cancellation.amount;

        // Update the intent
       // intent.remainingDeposits = 0;

        // Transfer the funds back to the user
        token.safeTransfer(cancellation.user, refundAmount);

        emit OffRampIntentRefunded(cancellation.offRampIntentID, cancellation.user, refundAmount);
        emit CancellationExecuted(_cancellationId, cancellation.offRampIntentID, cancellation.user, refundAmount);

        // Clean up the intent if no deposits remain
        delete offRamperIntents[cancellation.offRampIntentID];
    }

    /**
     * @notice Cancel a queued cancellation before it has been executed
     * @param _cancellationId    The unique ID of the cancellation to cancel
     */
    function cancelQueuedCancellation(bytes32 _cancellationId) external nonReentrant {
        Cancellation storage cancellation = cancellations[_cancellationId];
        require(cancellation.user == msg.sender, "Only the user can cancel their cancellation");
        require(queuedCancellations[_cancellationId], "Cancellation is not queued");
        require(!cancellation.executed, "Cancellation already executed");

        // Remove the queued cancellation
        queuedCancellations[_cancellationId] = false;

        emit CancellationCancelled(_cancellationId, cancellation.offRampIntentID, cancellation.user);

        delete cancellations[_cancellationId];
    }

    /* ============ Internal Functions ============ */

    /**
     * @notice Generate a unique cancellation ID
     * @param _offRampIntentID   The ID of the offRamp intent
     * @param _user              The address of the user
     * @param _timestamp         The current timestamp
     * @return bytes32           The unique cancellation ID
     */
    function getCancellationId(
        uint256 _offRampIntentID,
        address _user,
        uint256 _timestamp
    ) public pure returns (bytes32) { // Changed from internal to public
        return keccak256(abi.encodePacked(_offRampIntentID, _user, _timestamp));
    }

    /* ============ Admin Functions ============ */

    /**
     * @notice Set the minimum deposit amount
     * @param _minDepositAmount  The new minimum deposit amount
     */
    function setMinDepositAmount(uint256 _minDepositAmount) external onlyOwner {
        minDepositAmount = _minDepositAmount;
        emit MinDepositAmountSet(_minDepositAmount);
    }

    /**
     * @notice Set the maximum on-ramp amount
     * @param _maxOnRampAmount   The new maximum on-ramp amount
     */
    function setMaxOnRampAmount(uint256 _maxOnRampAmount) external onlyOwner {
        maxOnRampAmount = _maxOnRampAmount;
        emit MaxOnRampAmountSet(_maxOnRampAmount);
    }

    /**
     * @notice Set the on-ramp cooldown period
     * @param _onRampCooldownPeriod The new cooldown period in seconds
     */
    function setOnRampCooldownPeriod(uint256 _onRampCooldownPeriod) external onlyOwner {
        onRampCooldownPeriod = _onRampCooldownPeriod;
        emit OnRampCooldownPeriodSet(_onRampCooldownPeriod);
    }

    /**
     * @notice Set the sustainability fee
     * @param _sustainabilityFee The new sustainability fee
     */
    function setSustainabilityFee(uint256 _sustainabilityFee) external onlyOwner {
        require(_sustainabilityFee <= MAX_SUSTAINABILITY_FEE, "Fee exceeds maximum");
        sustainabilityFee = _sustainabilityFee;
        emit SustainabilityFeeSet(_sustainabilityFee);
    }

    /**
     * @notice Set the sustainability fee recipient
     * @param _sustainabilityFeeRecipient The new fee recipient address
     */
    function setSustainabilityFeeRecipient(address _sustainabilityFeeRecipient) external onlyOwner {
        require(_sustainabilityFeeRecipient != address(0), "Recipient cannot be zero address");
        sustainabilityFeeRecipient = _sustainabilityFeeRecipient;
        emit SustainabilityFeeRecipientSet(_sustainabilityFeeRecipient);
    }

    /* ============ View Functions ============ */

    /**
     * @notice Check if a cancellation is queued
     * @param _cancellationId The ID of the cancellation
     * @return bool            True if queued, else false
     */
    function isCancellationQueued(bytes32 _cancellationId) external view returns (bool) {
        return queuedCancellations[_cancellationId];
    }

    /**
     * @notice Get details of a cancellation
     * @param _cancellationId The ID of the cancellation
     * @return Cancellation    The cancellation details
     */
    function getCancellation(bytes32 _cancellationId) external view returns (Cancellation memory) {
        return cancellations[_cancellationId];
    }

    /**
     * @notice Initiates a new on-ramp process
     * @param _targetedOffRampIntentID The ID of the targeted off-ramp intent
     * @param _paymentData The fiat payment data for verification
     */
    function newOnRampIntent(
        uint256 _targetedOffRampIntentID,
        bytes calldata _paymentData
    ) external onlyRegisteredUser nonReentrant{
        
        // Retrieve the OffRampIntent using the provided ID
        OffRampIntent storage offRampIntent = offRamperIntents[_targetedOffRampIntentID];
        require(offRampIntent.offRamperAddress != address(0), "Invalid OffRampIntent ID"); //Checks if OffRampIntent ID is valid

        // Call the verifyPayment function from the PaymentVerifier contract
        bool isVerified = payPalPaymentVerifier.verifyPayment(msg.sender, _paymentData, offRampIntent.conversionRate, offRampIntent.offRampAmount);
        require(isVerified, "Payment verification failed");


        uint256 amountToTransfer = offRampIntent.offRampAmount;
        
        // Delete the OffRampIntent from the mapping
        delete offRamperIntents[_targetedOffRampIntentID];

        //Send onramper the funds from the escrow (here: this contract)
        token.safeTransfer(msg.sender, amountToTransfer);


        
        // Emit an event if necessary (optional)
        emit OnRampIntentVerified(_offRampIntentID, intent.offRamperAddress, msg.sender, msg.sender, amountToTransfer, 0);
    }
}

// NOTE:Signal OnRamping Intent --> Is done in the centralized server for now. Maintains persistent state.

// Function: OnRamp 
// TODO: Needs to
// - Verify the signature provided by the on-ramper
//   -  This can be done with isValidSignatureNow through the following import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
// TODO: What's the additional logic needed in onRamping?
// TODO: Check wether we want the registrator to be called through here in order to have a single point of entry
// TODO: Write test for everything