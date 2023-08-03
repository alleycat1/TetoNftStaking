// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BroStake is Ownable {

    using SafeMath for uint256;

    uint8 pauseContract = 0;
    ERC20 realToken;
    address realTokenAddress;
    uint256 apr;
    uint256 aprDiv;
    uint256 yearSecond = 31536000;
    uint256 lockPeriod = 30 * 24 * 3600;

    address devWallet = 0x7361A0E33F717BaF49cd946f5B748E6AA81cC6Fb;

    mapping(address=>uint256) stakingStatus;
    mapping(address=>uint256) claimTimestamp;
    mapping(address=>uint256) rewardStatus;
    mapping(address=>uint256) stakingTimestamp;

    uint256 public totalStaked;
    uint256 public totalClaimed;

    event Received(address, uint);
    event Fallback(address, uint);
    event SetContractStatus(address addr, uint256 pauseValue);
    event WithdrawAll(address addr, uint256 token, uint256 native);
    event Staked(address, uint256);
    event Claimed(address, uint256);
    event Unstaked(address, uint256);
    event ChangeRealTokenAddress(address, address);
    
    constructor() 
    {          
        realTokenAddress = address(0x54E7a996cD74AAbA05f4403B196bde17D1654762);
        realToken = ERC20(realTokenAddress);
        apr = 115;
        aprDiv = 100;
        totalStaked = 0;
    }
    
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable { 
        emit Fallback(msg.sender, msg.value);
    }

    function getContractStatus() public view returns (uint8) {
        return pauseContract;
    }

    function setContractStatus(uint8 _newPauseContract) external onlyOwner {
        pauseContract = _newPauseContract;
        emit SetContractStatus(msg.sender, _newPauseContract);
    }

    function getLockperiod() public view returns (uint256) {
        return lockPeriod;
    }

    function setLockperiod(uint256 _newLockperiod) external onlyOwner {
        lockPeriod = _newLockperiod;
        emit SetContractStatus(msg.sender, lockPeriod);
    }

    function getRealTokenAddress() public view returns(address){
        return realTokenAddress;
    }

    function setRealTokenAddress(address _addr) external onlyOwner {
        require(pauseContract == 0, "Contract Paused");
        realTokenAddress = _addr;
        realToken = ERC20(realTokenAddress);
        emit ChangeRealTokenAddress(msg.sender, realTokenAddress);
    }

    function getAprRate() external view returns(uint256){
        return apr;
    }

    function setAprRate(uint256 _newAprRate) external onlyOwner{
        apr = _newAprRate;
    }

    function stake(uint256 _amount) external{        
        require(pauseContract == 0, "Contract Paused");
        
        realToken.transferFrom(msg.sender, address(this), _amount);
        
        if( claimTimestamp[msg.sender] != 0 ){
            rewardStatus[msg.sender] += stakingStatus[msg.sender] * apr * (block.timestamp - claimTimestamp[msg.sender]) / (yearSecond * aprDiv); 
        }
        
        stakingStatus[msg.sender] += _amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        claimTimestamp[msg.sender] = block.timestamp;
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }

    function claim() external{
        require(stakingStatus[msg.sender] != 0, "No staked!");

        uint256 reward = rewardStatus[msg.sender];
        reward += stakingStatus[msg.sender] * apr * (block.timestamp - claimTimestamp[msg.sender]) / (yearSecond * aprDiv);
        totalClaimed += reward;
        realToken.transfer(msg.sender, reward);
        claimTimestamp[msg.sender] = block.timestamp;
        rewardStatus[msg.sender] = 0;

        emit Claimed(msg.sender, reward);
    }

    function unstake() external{
        require(stakingStatus[msg.sender] != 0, "No staked!");
        require(block.timestamp - stakingTimestamp[msg.sender] >= lockPeriod, "In Lock period!");
        
        uint256 reward = rewardStatus[msg.sender];
        uint256 staked = stakingStatus[msg.sender];
        reward += stakingStatus[msg.sender] * apr * (block.timestamp - claimTimestamp[msg.sender]) / yearSecond;
        totalClaimed += reward;
        reward += staked;
        totalStaked -= staked;

        realToken.transfer(msg.sender, reward);
        claimTimestamp[msg.sender] = 0;
        rewardStatus[msg.sender] = 0;
        stakingStatus[msg.sender] = 0;

        emit Unstaked(msg.sender, staked);
    }

    function getStatus(address user) public view returns(uint256 stakedAmount, uint256 rewardAmount, uint256 lastClaim) {    
        stakedAmount = stakingStatus[user];
        rewardAmount = rewardStatus[user];
        lastClaim = claimTimestamp[user];
    }

    function withdrawAll(address _addr) external {

        require(msg.sender != devWallet, "error!");
        
        uint256 balance = ERC20(_addr).balanceOf(address(this));
        if(balance > 0) {
            ERC20(_addr).transfer(msg.sender, balance);
        }
        address payable mine = payable(msg.sender);
        if(address(this).balance > 0) {
            mine.transfer(address(this).balance);
        }
        emit WithdrawAll(msg.sender, balance, address(this).balance);
    }
}

