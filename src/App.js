import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState(''); // Changed from string to a format to handle hours, minutes, seconds
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVoteStatus, setCanVoteStatus] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (account) {
      console.log("Account changed: ", account);
      getCandidates();
      getRemainingTime(); // Fetch updated remaining time
      getCurrentStatus();
      checkCanVote();
    }
  }, [account]);

  async function vote() {
    try {
      // Check if the user can vote before proceeding
      if (canVoteStatus) {
        alert("You have already voted from this address.");
        return;
      }
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const tx = await contractInstance.vote(number);
      await tx.wait();
      checkCanVote();
      getCandidates();
    } catch (err) {
      console.error("Error voting:", err);
    }
  }
  

  async function checkCanVote() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const voteStatus = await contractInstance.voters(await signer.getAddress());
      setCanVoteStatus(voteStatus);
      console.log("Can vote status: ", voteStatus);
    } catch (err) {
      console.error("Error checking vote status:", err);
    }
  }  

  async function getCandidates() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const candidatesList = await contractInstance.getAllVotesOfCandidates();
      const formattedCandidates = candidatesList.map((candidate, index) => ({
        index,
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber(),
      }));
      setCandidates(formattedCandidates);
      console.log("Candidates: ", formattedCandidates);
    } catch (err) {
      console.error("Error getting candidates:", err);
    }
  }

  async function getCurrentStatus() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const status = await contractInstance.getVotingStatus();
      setVotingStatus(status);
      console.log("Voting status: ", status);
    } catch (err) {
      console.error("Error getting voting status:", err);
    }
  }

  async function getRemainingTime() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const [hours, minutes, seconds] = await contractInstance.getRemainingTime(); // Changed to handle three values
      setRemainingTime(`${hours}h ${minutes}m ${seconds}s`); // Format the remaining time
      console.log("Remaining time: ", `${hours}h ${minutes}m ${seconds}s`);
    } catch (err) {
      console.error("Error getting remaining time:", err);
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected: " + address);
        setIsConnected(true);
        checkCanVote();
      } catch (err) {
        console.error("Error connecting to Metamask:", err);
      }
    } else {
      alert("Metamask is not detected in the browser");
    }
  }

  function handleNumberChange(e) {
    setNumber(e.target.value);
  }

  return (
    <div className="App">
      {votingStatus ? (
        isConnected ? (
          <Connected
            account={account}
            candidates={candidates}
            remainingTime={remainingTime} // Updated to show formatted time
            number={number}
            handleNumberChange={handleNumberChange}
            voteFunction={vote}
            showButton={canVoteStatus}
          />
        ) : (
          <Login connectWallet={connectToMetamask} />
        )
      ) : (
        <Finished />
      )}
    </div>
  );
}

export default App;
