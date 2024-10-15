// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../paypal/mock/MockRegistrator.sol";
import "../paypal/mock/MockOnRampProcessor.sol";
import "../paypal/interfaces/IPayPalAccountRegistry.sol";
import "../paypal/interfaces/IOnRampProcessor.sol";
import "../paypal/Ramp.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Assuming Uint256ArrayUtils is located in /contracts/external/Uint256ArrayUtils.sol
import "../external/Uint256ArrayUtils.sol";

// Mock ERC20 Token (USDC)
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    // Mint function for testing purposes
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract OffRamperTest is Test {
    using Uint256ArrayUtils for uint256[];
    using SafeERC20 for IERC20;

    // Contract Instances
    OffRamper offRamper;
    MockERC20 usdc;
    MockRegistrator mockRegistrator;
    MockOnRampProcessor mockOnRampProcessor;

    // Addresses
    address owner = address(this);
    address user = address(0x2);
    address unregisteredUser = address(0x4);
    address sustainabilityFeeRecipient = address(0x3);
    address verifierSigningKey = address(0xABC);
    address notary = address(0xDEF);

    // Constants
    uint256 minDepositAmount = 100 * 1e6; // USDC has 6 decimals
    uint256 maxOnRampAmount = 1000 * 1e6;
    uint256 intentExpirationPeriod = 1 days;
    uint256 onRampCooldownPeriod = 1 hours;
    uint256 sustainabilityFee = 1e16; // 1% (1e16 / 1e18 = 0.01)

    // Events (matching OffRamper.sol)
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
        address indexed onRamperAddress,
        address indexed offRamperAddress,
        address to,
        uint256 amount,
        uint256 feeAmount
    );
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

    // Additional Events for Setter Functions
    event MinDepositAmountSet(uint256 newMinDepositAmount);
    event MaxOnRampAmountSet(uint256 newMaxOnRampAmount);
    event OnRampCooldownPeriodSet(uint256 newOnRampCooldownPeriod);
    event SustainabilityFeeSet(uint256 newSustainabilityFee);
    event SustainabilityFeeRecipientSet(address newSustainabilityFeeRecipient);

    function setUp() public {
        // Deploy Mock USDC
        usdc = new MockERC20("USD Coin", "USDC");

        // Deploy Mock Registrator and register the user
        mockRegistrator = new MockRegistrator();
        mockRegistrator.register(user, "user_paypal_id");

        // Deploy Mock OnRampProcessor
        mockOnRampProcessor = new MockOnRampProcessor();

        // Deploy OffRamper contract
        offRamper = new OffRamper(
            owner, // Set the test contract as the owner
            IERC20(address(usdc)),
            minDepositAmount,
            maxOnRampAmount,
            intentExpirationPeriod,
            onRampCooldownPeriod,
            sustainabilityFee,
            sustainabilityFeeRecipient
        );

        // Initialize OffRamper with registrator and onRampProcessor
        vm.prank(owner);
        offRamper.initialize(IPayPalAccountRegistry(address(mockRegistrator)), IOnRampProcessor(address(mockOnRampProcessor)));

        // Mint USDC to the user and unregisteredUser
        usdc.mint(user, 1000 * 1e6);
        usdc.mint(unregisteredUser, 500 * 1e6);

        // Approve OffRamper to spend user's USDC
        vm.prank(user);
        usdc.approve(address(offRamper), type(uint256).max);

        // Approve OffRamper to spend unregisteredUser's USDC
        vm.prank(unregisteredUser);
        usdc.approve(address(offRamper), type(uint256).max);

        // Optionally, set up other initial states or mock behaviors
    }

    function testNewOffRampIntent() public {
        string memory paypalID = "user_paypal_id";
        uint256 depositAmount = 500 * 1e6; // 500 USDC
        uint256 receiveAmount = 100 * 1e6; // 100 units of off-chain currency
        bytes32 localNotaryKeyHash = keccak256("notary_key"); // Renamed to avoid conflict

        // Calculate expected conversion rate
        uint256 expectedConversionRate = (depositAmount * 1e18) / receiveAmount;

        // Expect the OffRampIntentCreated event
        vm.expectEmit(true, true, false, true);
        emit OffRampIntentCreated(
            0, // offRampIntentID
            user,
            paypalID,
            depositAmount,
            expectedConversionRate
        );

        // Create a new off-ramp intent as the user
        vm.prank(user);
        offRamper.newOffRampIntent(
            paypalID,
            depositAmount,
            receiveAmount,
            verifierSigningKey, // Use the state variable
            localNotaryKeyHash
        );

        // Destructure the tuple returned by the mapping
        (
            address offRamperAddress,
            string memory intentPaypalID,
            address _verifierSigningKey,
            bytes32 notaryKeyHash,
            uint256 offRampAmount,
            bytes32 receiveCurrencyId,
            uint256 remainingDeposits,
            uint256 conversionRate,
            uint256 createdAt
        ) = offRamper.offRamperIntents(0);

        // Verify the intent is stored correctly
        assertEq(offRamperAddress, user, "Incorrect offRamperAddress");
        assertEq(intentPaypalID, paypalID, "Incorrect PayPal ID");
        assertEq(offRampAmount, depositAmount, "Incorrect offRampAmount");
        assertEq(receiveCurrencyId, bytes32(0), "Incorrect receiveCurrencyId");
        assertEq(remainingDeposits, depositAmount, "Incorrect remainingDeposits");
        assertEq(conversionRate, expectedConversionRate, "Incorrect conversionRate");
        assertTrue(createdAt > 0, "Incorrect createdAt");

        // Verify USDC was transferred to the OffRamper contract
        assertEq(usdc.balanceOf(address(offRamper)), depositAmount, "USDC not transferred to OffRamper");
        assertEq(usdc.balanceOf(user), 1000 * 1e6 - depositAmount, "User USDC balance incorrect");
    }

    function testFailNewOffRampIntent_UnregisteredUser() public {
        string memory paypalID = "unregistered_paypal_id";
        uint256 depositAmount = 500 * 1e6; // 500 USDC
        uint256 receiveAmount = 100 * 1e6; // 100 units of off-chain currency
        bytes32 notaryKeyHash = keccak256("notary_key");

        // Attempt to create an off-ramp intent as an unregistered user
        vm.prank(unregisteredUser);
        offRamper.newOffRampIntent(
            paypalID,
            depositAmount,
            receiveAmount,
            verifierSigningKey,
            notaryKeyHash
        );
    }

    function testQueueAndExecuteCancellation() public {
        string memory paypalID = "user_paypal_id";
        uint256 depositAmount = 500 * 1e6; // 500 USDC
        uint256 receiveAmount = 100 * 1e6; // 100 units of off-chain currency
        bytes32 notaryKeyHash = keccak256("notary_key");

        // Create a new off-ramp intent as the user
        vm.prank(user);
        offRamper.newOffRampIntent(
            paypalID,
            depositAmount,
            receiveAmount,
            verifierSigningKey,
            notaryKeyHash
        );

        // Destructure the tuple to get the createdAt field
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint256 createdAt
        ) = offRamper.offRamperIntents(0);

        // Queue a cancellation
        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        bytes32 expectedCancellationId = offRamper.getCancellationId(0, user, createdAt);
        emit CancellationQueued(
            expectedCancellationId,
            0,
            user,
            block.timestamp + offRamper.MIN_DELAY()
        );
        vm.prank(user);
        offRamper.queueCancellation(0);

        // Fast-forward time to after MIN_DELAY
        vm.warp(block.timestamp + offRamper.MIN_DELAY() + 1);

        // Expect the OffRampIntentRefunded and CancellationExecuted events
        vm.expectEmit(true, true, true, true);
        emit OffRampIntentRefunded(0, user, depositAmount);
        vm.expectEmit(true, true, true, true);
        emit CancellationExecuted(expectedCancellationId, 0, user, depositAmount);

        // Execute the cancellation
        vm.prank(user);
        offRamper.executeCancellation(expectedCancellationId);

        // Verify the intent is deleted by checking remainingDeposits is 0
        (
            ,
            ,
            ,
            ,
            ,
            ,
            uint256 remainingDeposits,
            ,
            // uint256 createdAtAfterCancellation // Not needed
        ) = offRamper.offRamperIntents(0);
        assertEq(remainingDeposits, 0, "remainingDeposits should be 0");

        // Verify USDC was returned to the user
        assertEq(usdc.balanceOf(user), 1000 * 1e6, "USDC not refunded to user");
        assertEq(usdc.balanceOf(address(offRamper)), 0, "OffRamper USDC balance should be 0");
    }

    function testCancelQueuedCancellation() public {
        string memory paypalID = "user_paypal_id";
        uint256 depositAmount = 500 * 1e6; // 500 USDC
        uint256 receiveAmount = 100 * 1e6; // 100 units of off-chain currency
        bytes32 notaryKeyHash = keccak256("notary_key");

        vm.prank(user);
        // Create a new off-ramp intent as the user
        offRamper.newOffRampIntent(
            paypalID,
            depositAmount,
            receiveAmount,
            verifierSigningKey,
            notaryKeyHash
        );

        // Destructure the tuple to get the createdAt field
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint256 createdAt
        ) = offRamper.offRamperIntents(0);

        // Queue a cancellation
        vm.prank(user);
        offRamper.queueCancellation(0);
        bytes32 cancellationId = offRamper.getCancellationId(0, user, createdAt);

        // Cancel the queued cancellation before execution
        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        emit CancellationCancelled(cancellationId, 0, user);
        offRamper.cancelQueuedCancellation(cancellationId);

        // Verify the cancellation is removed
        assertFalse(offRamper.queuedCancellations(cancellationId), "Cancellation should not be queued");

        // Destructure the tuple returned by the cancellations mapping
        (
            uint256 cancellationOffRampIntentID,
            address cancellationUser,
            uint256 cancellationAmount,
            uint256 cancellationExecuteAt,
            bool cancellationExecuted
        ) = offRamper.cancellations(cancellationId);

        assertEq(cancellationOffRampIntentID, 0, "Cancellation offRampIntentID should be reset");
        assertEq(cancellationUser, address(0), "Cancellation user should be reset");
        assertEq(cancellationAmount, 0, "Cancellation amount should be reset");
        assertEq(cancellationExecuteAt, 0, "Cancellation executeAt should be reset");
        assertFalse(cancellationExecuted, "Cancellation executed flag should be reset");
    }

    function testFailExecuteCancellation_TooEarly() public {
        string memory paypalID = "user_paypal_id";
        uint256 depositAmount = 500 * 1e6; // 500 USDC
        uint256 receiveAmount = 100 * 1e6; // 100 units of off-chain currency
        bytes32 notaryKeyHash = keccak256("notary_key");

        // Create a new off-ramp intent as the user
        vm.prank(user);
        offRamper.newOffRampIntent(
            paypalID,
            depositAmount,
            receiveAmount,
            verifierSigningKey,
            notaryKeyHash
        );

        // Destructure the tuple to get the createdAt field
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint256 createdAt
        ) = offRamper.offRamperIntents(0);

        // Queue a cancellation
        vm.prank(user);
        offRamper.queueCancellation(0);
        bytes32 cancellationId = offRamper.getCancellationId(0, user, createdAt);

        // Attempt to execute cancellation before MIN_DELAY has passed
        vm.prank(user);
        offRamper.executeCancellation(cancellationId);
    }

    function testSetters() public {
        // Set new minimum deposit amount
        uint256 newMinDeposit = 200 * 1e6;
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit MinDepositAmountSet(newMinDeposit);
        offRamper.setMinDepositAmount(newMinDeposit);
        assertEq(offRamper.minDepositAmount(), newMinDeposit, "minDepositAmount not updated");

        // Set new maximum on-ramp amount
        uint256 newMaxOnRamp = 2000 * 1e6;
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit MaxOnRampAmountSet(newMaxOnRamp);
        offRamper.setMaxOnRampAmount(newMaxOnRamp);
        assertEq(offRamper.maxOnRampAmount(), newMaxOnRamp, "maxOnRampAmount not updated");

        // Set new on-ramp cooldown period
        uint256 newCooldown = 2 hours;
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit OnRampCooldownPeriodSet(newCooldown);
        offRamper.setOnRampCooldownPeriod(newCooldown);
        assertEq(offRamper.onRampCooldownPeriod(), newCooldown, "onRampCooldownPeriod not updated");

        // Set new sustainability fee
        uint256 newFee = 2e16; // 2%
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit SustainabilityFeeSet(newFee);
        offRamper.setSustainabilityFee(newFee);
        assertEq(offRamper.sustainabilityFee(), newFee, "sustainabilityFee not updated");

        // Set new sustainability fee recipient
        address newFeeRecipient = address(0x5);
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit SustainabilityFeeRecipientSet(newFeeRecipient);
        offRamper.setSustainabilityFeeRecipient(newFeeRecipient);
        assertEq(offRamper.sustainabilityFeeRecipient(), newFeeRecipient, "sustainabilityFeeRecipient not updated");
    }

    // Additional helper functions or tests can be added below as needed
}