// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    address owner;
    mapping(address => bool) public voters;

    uint256 public votingStart;
    uint256 public votingEnd;
    bool public votingFinished;

    event WinnerDeclared(uint256 indexed winnerIndex, string winnerName, uint256 voteCount);
    event Voted(address indexed voter, uint256 candidateIndex); // Define Voted event

    constructor(string[] memory _candidateNames, uint256 _durationInMinutes) {
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        votingFinished = false;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can call this");
        _;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate({
            name: _name,
            voteCount: 0
        }));
    }

    function vote(uint256 _candidateIndex) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");
        require(!votingFinished, "Voting is finished.");

        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;
        emit Voted(msg.sender, _candidateIndex); // Emit Voted event
    }

    function declareWinner() public onlyOwner {
        require(block.timestamp >= votingEnd, "Voting is not yet finished.");

        uint256 maxVotes = 0;
        uint256 winnerIndex;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        votingFinished = true;
        emit WinnerDeclared(winnerIndex, candidates[winnerIndex].name, candidates[winnerIndex].voteCount);
    }

    function getAllVotesOfCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd && !votingFinished);
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }
}
