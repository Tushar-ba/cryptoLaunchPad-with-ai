// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LaunchToken.sol";

contract NewLaunchpad is ReentrancyGuard, Pausable  {


  uint public PROJECTID;
  uint public AMOUNT_INVESTED;
  address public owner;

    constructor() {
        owner = msg.sender;
    }
  
  modifier onlyOwner() {
    require(msg.sender == owner,"Cannot do this operation");
    _;
  }

    struct Project{
        uint256 projectId;
        address creator;
        string name;
        string description;
        uint256 goal;
        uint256 fixedInvest;
        uint totalCollected;
        uint256 fundingPeriodStart;
        uint256 fundingPeriodEnd;
        uint totalInvestors;
        address tokenContractAddress;
        bool canStillFund;
        uint minimumpay;
        uint sendingTokensToSender;
        uint totalWithdrawable;
        bool isActive;
    }

    struct Investment{
        uint256 projectId;
        address investor;
        uint256 amount;
        uint tokenSupply;
    }

    mapping (uint256 => Project) public project;
    mapping (address => Investment) public investment;

    event projectCreated(address _owner, uint _projectId, uint goal);
    event tokensMinted(address _owner, uint _projectId, uint _supply, address _token);
    event Invested(address _investor, uint _projectId, uint _amount, uint _tokenSupply);
    event tokensTransferred(address _investor, uint _projectId, uint _amount, address _token);
    event Withdrawn(address _to, uint prjectId);

    function createProject(string calldata _symbol, uint _initialSupply, string calldata _name, string calldata _description, uint goal, uint fixedInvest,uint _startTime, uint _endTime, uint _minimumpay , uint _sendingTokensToSender) external {
        require(goal > 0, "Goal must be greater than 0");
        //require(_minInvest > 0, "Min investment must be greater than 0");
        require(fixedInvest > 0, "Max investment must be greater than 0");
        require(_startTime > 0, "Start time must be greater than 0");
        require(_endTime > 0, "End time must be greater than 0");
        require(_endTime > _startTime, "End time must be greater than start time");
        uint projectId = ++PROJECTID;
        Project storage newProject = project[projectId];
        newProject.projectId = projectId;
        newProject.creator = msg.sender;
        newProject.name = _name;
        newProject.description = _description;
        newProject.goal = goal;
        //newProject.minInvest = _minInvest;
        newProject.fixedInvest = fixedInvest;
        newProject.fundingPeriodStart = _startTime;
        newProject.fundingPeriodEnd = _endTime;
        if(_startTime < block.timestamp && block.timestamp < _endTime){
            newProject.canStillFund = true;
        }
        newProject.totalInvestors = 0;
        newProject.totalCollected = 0;
        newProject.tokenContractAddress = mintToken(_name, _symbol, _initialSupply, address(this));
        newProject.minimumpay = _minimumpay;
        newProject.sendingTokensToSender = _sendingTokensToSender;
        newProject.totalWithdrawable = 0;
        newProject.isActive = true;
        //IERC20(newProject.tokenContractAddress).approve(address(this), _initialSupply);
        IERC20(newProject.tokenContractAddress).approve(address(this), _initialSupply);

        emit projectCreated(msg.sender, PROJECTID, goal);
    }

    function mintToken(string calldata _name, string calldata _symbol, uint _initialSupply, address _owner) internal returns (address) {
        require(_initialSupply > 0, "Initial supply must be greater than 0");
        require(_owner != address(0), "Invalid owner address");
        LaunchToken newToken = new LaunchToken(_name, _symbol, _initialSupply, _owner);
        emit tokensMinted(_owner, PROJECTID, _initialSupply, address(newToken));
        return address(newToken);
    }

    function investorMint(uint _projectId) internal {
        Project memory currentProject = project[_projectId];
        require(currentProject.projectId == _projectId, "Invalid project id");
        require(msg.sender != address(0), "Invalid owner address");
        IERC20(currentProject.tokenContractAddress).transfer(msg.sender, 10000);
        IERC20(currentProject.tokenContractAddress).approve(msg.sender, 10000);
        emit tokensTransferred(msg.sender, _projectId, 10000, currentProject.tokenContractAddress);
    }


    function Invest(uint _projectId) external payable {
        //require(_amount > 0, "Amount must be greater than 0");
         require(project[_projectId].creator != address(0), "Project does not exist");
        Project storage currentProject = project[_projectId];
        // uint _totalWithdrawable = ;
        require(currentProject.isActive, "Project funding is complete");
        project[_projectId].totalWithdrawable += msg.value;
        require(currentProject.minimumpay <= msg.value,"Not enough funds");
        require(msg.value > 0, "Amount must be greater than 0");
        require(currentProject.canStillFund, "Project funding period has ended");
        //require(currentProject.minInvest <= msg.value, "Amount must be greater than min investment");
        require(currentProject.fixedInvest == msg.value, "Amount must be less than max investment");
        require(currentProject.totalCollected + msg.value <= currentProject.goal, "Amount must be less than goal");
        require(currentProject.fundingPeriodStart < block.timestamp && block.timestamp < currentProject.fundingPeriodEnd, "Cannot invest outside funding period");
        investorMint(_projectId);   
        currentProject.totalCollected += msg.value;
        currentProject.totalInvestors++;

        if (currentProject.totalCollected >= currentProject.goal) {
            currentProject.isActive = false;
        }

        Investment storage newInvestment = investment[msg.sender];
        newInvestment.projectId = _projectId;
        newInvestment.investor = msg.sender;
        newInvestment.amount = msg.value;
        newInvestment.tokenSupply = 10000;

        // (bool success, ) = payable(address(this)).call{value: msg.value}("");
        // require(success, "Transfer failed");
        emit Invested(msg.sender, _projectId, 10000, newInvestment.tokenSupply);
    }   

    function withdrawFunding(uint _projectId) external {
        require(_projectId > 0, "Invalid project id");
        require(project[_projectId].creator == msg.sender, "Not project owner");
        require(msg.sender != address(0), "Invalid owner address");
        require(project[_projectId].totalWithdrawable > 0, "No funds to withdraw");
        require(!project[_projectId].isActive, "Project is still active");
        require(project[_projectId].fundingPeriodEnd < block.timestamp, "Funding period has not ended");

        uint withdrawAmount = project[_projectId].totalWithdrawable;
        project[_projectId].totalWithdrawable = 0;

        (bool success, ) = msg.sender.call{value: withdrawAmount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, withdrawAmount);
    }

    function getProject(uint _projectId) external view returns (Project memory) {
        return project[_projectId];
    }
    function getInvestors(address _of) external view returns (Investment memory) {
        return investment[_of];
    }

    function isProjectActive(uint _projectId) external view returns (bool) {
        return project[_projectId].isActive;
    }
}