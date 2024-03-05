import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// Assuming the ABI is exported from a separate file. Update the path accordingly.
import CounterABI from '../Contracts/Counter.json';

const CounterComponent = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [number, setNumber] = useState(0);
  const [inputNumber, setInputNumber] = useState('');

  useEffect(() => {
    const loadBlockchainData = async () => {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const contractAddress = '0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35'; // Replace with your contract's address
      const counter = new web3.eth.Contract(CounterABI.abi, contractAddress);
      setContract(counter);

      const result = await counter.methods.number().call();
      console.log("Result:", result)
      setNumber(result.toString());
    };

    loadBlockchainData();
  }, []);

  const updateNumber = async () => {
    await contract.methods.setNumber(inputNumber).send({ from: account });
    const result = await contract.methods.number().call();
    console.log("Result:", result)
    setNumber(result.toString());
  };

  const incrementNumber = async () => {
    await contract.methods.increment().send({ from: account });
    const result = await contract.methods.number().call();
    console.log("Result:", result)
    setNumber(result.toString());
  };

  return (
    <div>
      <h2>Current Number: {number}</h2>
      <input
        type="number"
        value={inputNumber}
        onChange={(e) => setInputNumber(e.target.value)}
      />
      <button onClick={updateNumber}>Set Number</button>
      <button onClick={incrementNumber}>Increment Number</button>
    </div>
  );
};

export default CounterComponent;
