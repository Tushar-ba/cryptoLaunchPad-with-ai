// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LaunchToken.sol";

contract NewLaunchpad is ReentrancyGuard, Pausable {
    uint public PROJECTID;
    uint public AMOUNT_INVESTED;
    address public owner;
    uint private VALUE_SENT;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Cannot do this operation");
        _;
    }

    struct Project {
        uint256 projectId;
        address creator;
        string name;
        string description;
        uint256 goal;
        uint totalCollected;
        uint256 fundingPeriodStart;
        uint256 fundingPeriodEnd;
        uint totalInvestors;
        address tokenContractAddress;
        uint maxPay;
        uint minimumpay;
        uint totalWithdrawable;
        bool isActive;
        uint ratioOfTokens;
    }

    struct Investment {
        uint256 projectId;
        address investor;
        uint256 amount;
        uint tokenSupply;
    }

    mapping(uint256 => Project) public project;
    mapping(address => Investment) public investment;

    event projectCreated(address _owner, uint _projectId, uint goal);
    event tokensMinted(
        address _owner,
        uint _projectId,
        uint _supply,
        address _token
    );
    event Invested(
        address _investor,
        uint _projectId,
        uint _amount,
        uint _tokenSupply
    );
    event tokensTransferred(
        address _investor,
        uint _projectId,
        uint _amount,
        address _token
    );
    event Withdrawn(address _to, uint projectId);

    function createProject(
        string calldata _symbol,
        uint _initialSupply,
        string calldata _name,
        string calldata _description,
        uint goal,
        uint _startTime,
        uint _endTime,
        uint _minimumpay,
        uint _ratioOfTokens,
        uint _maxPay
    ) external {
        require(goal > 0, "Goal must be greater than 0");
        require(_startTime > 0, "Start time must be greater than 0");
        require(_endTime > 0, "End time must be greater than 0");
        require(
            _endTime > _startTime,
            "End time must be greater than start time"
        );
        require(_ratioOfTokens > 0, "Ration of tokens cannot be 0");
        uint projectId = ++PROJECTID;
        Project storage newProject = project[projectId];
        newProject.projectId = projectId;
        newProject.creator = msg.sender;
        newProject.name = _name;
        newProject.description = _description;
        newProject.goal = goal;
        newProject.maxPay = _maxPay;
        newProject.fundingPeriodStart = _startTime;
        newProject.fundingPeriodEnd = _endTime;
        if (_startTime < block.timestamp && block.timestamp < _endTime) {
            newProject.isActive = true;
        }
        newProject.ratioOfTokens = _ratioOfTokens;
        newProject.totalInvestors = 0;
        newProject.totalCollected = 0;
        newProject.tokenContractAddress = mintToken(
            _name,
            _symbol,
            _initialSupply,
            address(this)
        );
        newProject.minimumpay = _minimumpay;
        newProject.totalWithdrawable = 0;
        newProject.isActive = true;
        IERC20(newProject.tokenContractAddress).approve(
            address(this),
            _initialSupply
        );

        emit projectCreated(msg.sender, PROJECTID, goal);
    }

    function mintToken(
        string calldata _name,
        string calldata _symbol,
        uint _initialSupply,
        address _owner
    ) internal returns (address) {
        require(_initialSupply > 0, "Initial supply must be greater than 0");
        require(_owner != address(0), "Invalid owner address");
        uint256 adjustedSupply = _initialSupply * 10 ** 18;
        LaunchToken newToken = new LaunchToken(
            _name,
            _symbol,
            adjustedSupply,
            _owner
        );
        emit tokensMinted(_owner, PROJECTID, adjustedSupply, address(newToken));
        return address(newToken);
    }

    function investorMint(uint _projectId, uint _value) internal {
        Project memory currentProject = project[_projectId];
        _value = VALUE_SENT;
        require(currentProject.projectId == _projectId, "Invalid project id");
        require(msg.sender != address(0), "Invalid owner address");
      uint tokensToTransfer = (_value * currentProject.ratioOfTokens) / currentProject.minimumpay;
        IERC20(currentProject.tokenContractAddress).transfer(
            msg.sender,
            tokensToTransfer
        );
        IERC20(currentProject.tokenContractAddress).approve(
            msg.sender,
            tokensToTransfer
        );
        emit tokensTransferred(
            msg.sender,
            _projectId,
            tokensToTransfer,
            currentProject.tokenContractAddress
        );
    }

    function Invest(uint _projectId) external payable {
        VALUE_SENT = msg.value;
        require(
            project[_projectId].creator != address(0),
            "Project does not exist"
        );
        Project storage currentProject = project[_projectId];
        require(
            VALUE_SENT <= currentProject.maxPay ,
            "Cannot invest huge amount"
        );
        require(currentProject.isActive, "Project funding is complete");
        project[_projectId].totalWithdrawable += msg.value;
        require(VALUE_SENT >= currentProject.minimumpay , "Not enough funds");
        require(VALUE_SENT > 0, "Amount must be greater than 0");
        require(
            currentProject.totalCollected + VALUE_SENT <= currentProject.goal,
            "Amount must be less than goal"
        );
        require(
            currentProject.fundingPeriodStart < block.timestamp &&
                block.timestamp < currentProject.fundingPeriodEnd,
            "Cannot invest outside funding period"
        );
        investorMint(_projectId, VALUE_SENT);
        currentProject.totalCollected += msg.value;
        currentProject.totalInvestors++;

        if (currentProject.totalCollected == currentProject.goal) {
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
        require(
            project[_projectId].totalWithdrawable > 0,
            "No funds to withdraw"
        );
        require(!project[_projectId].isActive, "Project is still active");
        require(
            project[_projectId].fundingPeriodEnd < block.timestamp,
            "Funding period has not ended"
        );

        uint withdrawAmount = project[_projectId].totalWithdrawable;
    
        (bool success, ) = msg.sender.call{value: withdrawAmount}("");
        require(success, "Transfer failed");
        
        project[_projectId].totalWithdrawable = 0;

        emit Withdrawn(msg.sender, _projectId);
    }

    function getProject(
        uint _projectId
    ) external view returns (Project memory) {
        return project[_projectId];
    }

    function getInvestors(
        address _of
    ) external view returns (Investment memory) {
        return investment[_of];
    }

    function isProjectActive(uint _projectId) external view returns (bool) {
        return project[_projectId].isActive;
    }
}
