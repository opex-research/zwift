#!/bin/bash

# Sequentially update git submodules
git submodule update --init --recursive ./


# After submodule updates are done, proceed with other tasks in new terminals

# Open new terminal for Anvil
osascript <<END
tell application "Terminal"
    do script "anvil"
end tell
END

# Open new terminal for contracts setup
osascript <<END
tell application "Terminal"
    do script "cd \"$(pwd)/Contracts\"; sleep 5; forge create Registrator --rpc-url http://localhost:8545 --from 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 --unlocked && forge create OffRamper --rpc-url http://localhost:8545 --from 0x90F79bf6EB2c4f870365E785982E1f101E93b906 --unlocked && forge create PeerFinder --rpc-url http://localhost:8545 --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked && forge create Orchestrator --rpc-url http://localhost:8545 --from 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f --unlocked --constructor-args 0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35 0x057ef64E23666F000b34aE31332854aCBd1c8544 0x5FbDB2315678afecb367f032d93F642f64180aa3" 
end tell
END

# Open new terminal for Frontend setup and start
osascript <<END
tell application "Terminal"
    do script "cd \"$(pwd)/Frontend/zwift\"; npm install; npm start"
end tell
END
