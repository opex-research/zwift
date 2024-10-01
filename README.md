<div align="center">
  
# Zwift - Trustless Exchange of Crypto and FIAT

[![Ethereum L2](https://img.shields.io/badge/Ethereum-L2-brightgreen)](https://ethereum.org/)
[![React 17.x](https://img.shields.io/badge/React-17.x-61DAFB.svg)](https://reactjs.org/)
[![Node.js 21.6.2](https://img.shields.io/badge/Node.js-21.6.2-339933.svg)](https://nodejs.org/)
[![Foundry Toolkit](https://img.shields.io/badge/Foundry-Toolkit-orange.svg)](https://book.getfoundry.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Zwift leverages the power of Zero-Knowledge Proofs (ZKPs) and TLS Oracles to create a trustless environment for buying and selling cryptocurrencies. This platform is designed to minimize trust in traditional exchanges by allowing direct, secure, and private transactions between users.

</div>


## Objectives

- **Trustless Onboarding:** Develop an MVP for seamless integration with an Ethereum L2 solution.
- **Privacy-Preserving P2P AMM:** Prototype a decentralized, privacy-focused Automated Market Maker.
- **Optimized TLS Oracles:** Enhance the performance and reliability of SNARK-based TLS Oracles.

<!-- ## Submodules

### TLS Oracle (ORIGO)

**Purpose:** ORIGO authenticates data outside the client-server connection, enabling data provenance verification by any third-party without server modifications. It leverages TLS 1.3 to introduce a third-party verifier into TLS sessions, ensuring data integrity and confidentiality.

- **Location:** `TLS_Notary`
- **Repository:** [tls-oracle-demo](https://github.com/opex-research/tls-oracle-demo)

### Forge Standard Library

**Purpose:** This library offers a suite of utility contracts and test aids, simplifying and accelerating smart contract development with Foundry's forge.

- **Location:** `Contracts/lib/forge-std`
- **Repository:** [forge-std](https://github.com/foundry-rs/forge-std)

### OpenZeppelin Contracts

**Purpose:** A foundational library for secure smart contract development, offering a wide range of security-focused modules and templates.

- **Location:** `Contracts/lib/openzeppelin-contracts`
- **Repository:** [openzeppelin-contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) -->

## How to Run

1. **Setup and Dependencies:**
    ```sh
    ./setup_project.sh
    ```
    This script installs necessary dependencies and configures the development environment.

2. **Setup Local Blockchain + Metamask Integration:**
    - Configure MetaMask to connect with the local Anvil chain for streamlined development testing.
    - Add RPC URL - http://127.0.0.1:8545
    - Chain ID - 31337
    - Currency - ZWIFT (or whatever you want to name it)
    - Check newly created anvil account and private key in terminal
    - Add a private key from the local blockchain into MetaMask for interacting with ZWIFT contracts.

The anvil testnet should have deployed the contracts already and you should be ready to interact with them given the above specified tokens on the local testnet.
Before restarting, ensure that the "activity tab data" is cleared in Metamask.

3. **Create OffRamp Intent:**
- Navigate OffRamp page
- Click on "Create OffRamp Intent"
- Fill out the form and click "Create"
- You should see a success message and the OffRamp Intent ID

In case you want to re-run the local demo, clean the database files by running:

```sh
./cleanup_project.sh  
```

<!-- ## Contributing

Contributions are welcomed and appreciated:

1. **Fork** the repository.
2. **Create** your feature branch: `git checkout -b feature/YourAmazingFeature`.
3. **Commit** your changes: `git commit -m 'Add some YourAmazingFeature'`.
4. **Push** to the branch: `git push origin feature/YourAmazingFeature`.
5. **Submit** a pull request. -->

## License

Licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

Special thanks to Jens Ernstberger, Jan Lauinger and the broader Ethereum community for their invaluable contributions and support.
