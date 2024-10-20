// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/forge-std/Test.sol";
import "../paypal/Ramp.sol";
import "../paypal/interfaces/IPayPalPaymentVerifier.sol";
import "../paypal/interfaces/IPayPalRegistrator.sol";
import "../lib/openzeppelin-contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/token/ERC20/ERC20.sol"; // Needed for the MockERC20 token

// Mock PayPal Registrator
contract MockPayPalRegistrator is IPayPalRegistrator {
    mapping(address => string) public registeredEmails;

    function register(bytes calldata _accountData) external override returns (bool) {
        registeredEmails[msg.sender] = string(_accountData);
        return true;
    }

    function isRegistered(address wallet) external view override returns (bool) {
        return bytes(registeredEmails[wallet]).length > 0;
    }

    function getEmail(address wallet) external view override returns (string memory) {
        return registeredEmails[wallet];
    }
}

// Mock PayPal Payment Verifier
contract MockPayPalPaymentVerifier is IPayPalPaymentVerifier {
    function verifyPayment(
        address,
        PaymentData memory,
        uint256,
        uint256
    ) external pure override returns (bool) {
        return true;
    }
}

// Mock ERC20 Token for Testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol) {
        _mint(msg.sender, 1e24); // Mint 1 million tokens for testing
    }

    function decimals() public view override returns (uint8) {
        return 18;
    }
}

contract RampTest is Test {
    Ramp public ramp;
    MockERC20 public token;
    MockPayPalRegistrator public registrator;
    MockPayPalPaymentVerifier public verifier;

    address public user = address(0x123);
    address public owner = address(0xABC);
    address public sustainabilityFeeRecipient = address(0xDEF);
    uint256 public minDepositAmount = 1e18;  // 1 USDC (with 18 decimals)
    uint256 public maxOnRampAmount = 100e18; // 100 USDC

    function setUp() public {
        // Deploy a mock token, registrator, and verifier
        token = new MockERC20("USD Coin", "USDC", 18);
        registrator = new MockPayPalRegistrator();
        verifier = new MockPayPalPaymentVerifier();

        // Deploy Ramp contract
        ramp = new Ramp(owner, token, minDepositAmount, maxOnRampAmount, 1 days, 1 hours, 5e16, sustainabilityFeeRecipient);

        // Initialize Ramp with registrator and verifier
        vm.prank(owner);
        ramp.initialize(registrator, verifier);
    }

    function testInitialization() public {
        assertEq(ramp.isInitialized(), true);
        assertEq(address(ramp.payPalRegistrator()), address(registrator));
        assertEq(address(ramp.payPalPaymentVerifier()), address(verifier));
    }

    function testNewOffRampIntent() public {
        // Register user in mock registrator
        bytes memory accountData = abi.encode("user@example.com");
        registrator.register(accountData);

        // Simulate user registering and approving token for the Ramp contract
        vm.startPrank(user);
        token.approve(address(ramp), minDepositAmount);

        string memory paypalID = "user@example.com";
        uint256 depositAmount = minDepositAmount;
        uint256 receiveAmount = 10;
        address verifierSigningKey = address(0x1);
        bytes32 notaryKeyHash = keccak256(abi.encode("notary"));

        // Call newOffRampIntent
        ramp.newOffRampIntent(paypalID, depositAmount, receiveAmount, verifierSigningKey, notaryKeyHash);

        Ramp.OffRampIntent memory intent = ramp.offRamperIntents(0);

        // Check if OffRampIntent has correct data
        assertEq(intent.offRamperAddress, user);
        assertEq(intent.paypalID, paypalID);
        assertEq(intent.offRampAmount, depositAmount);
        assertEq(intent.conversionRate, depositAmount * 1e18 / receiveAmount);
        vm.stopPrank();
    }

    function testQueueAndExecuteCancellation() public {
        // Register user in mock registrator
        bytes memory accountData = abi.encode("user@example.com");
        registrator.register(accountData);

        // Simulate user registering and approving token for the Ramp contract
        vm.startPrank(user);
        token.approve(address(ramp), minDepositAmount);

        string memory paypalID = "user@example.com";
        uint256 depositAmount = minDepositAmount;
        uint256 receiveAmount = 10;
        address verifierSigningKey = address(0x1);
        bytes32 notaryKeyHash = keccak256(abi.encode("notary"));

        // Create a new OffRampIntent
        ramp.newOffRampIntent(paypalID, depositAmount, receiveAmount, verifierSigningKey, notaryKeyHash);

        // Queue cancellation
        ramp.queueCancellation(0);

        bytes32 cancellationId = ramp.getCancellationId(0, user, block.timestamp);

        assertEq(ramp.queuedCancellations(cancellationId), true);

        // Fast forward time to execute the cancellation
        vm.warp(block.timestamp + 11 minutes);

        // Execute cancellation
        ramp.executeCancellation(cancellationId);

        Ramp.Cancellation memory cancellation = ramp.cancellations(cancellationId);

        // Check if the cancellation executed correctly
        assertEq(cancellation.executed, true);
        assertEq(token.balanceOf(user), depositAmount); // User should have their deposit back
        vm.stopPrank();
    }
}
