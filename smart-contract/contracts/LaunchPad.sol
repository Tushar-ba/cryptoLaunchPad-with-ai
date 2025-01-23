
// pragma solidity 0.8.27;

// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/Pausable.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract LaunchPad is ReentrancyGuard, Pausable, Ownable {
//     struct Project {
//         string name;
//         string description;
//         string website;
//         string whitepaper;
//         string[] socialLinks;
//         address tokenAddress;
//         address owner;
//         uint256 goal;
//         uint256 totalRaised;
//         uint256 startTime;
//         uint256 endTime;
//         uint256 tokenPrice;
//         bool active;
//         bool finalized;
//         SaleStage currentStage;
//         uint256 totalParticipants;
//         uint256 minContribution;
//         uint256 maxContribution;
//     }
    
//     enum SaleStage { PENDING, WHITELIST, PUBLIC, ENDED }
    
//     Project[] public projects;
//     mapping(uint256 => mapping(address => uint256)) public contributions;
//     mapping(uint256 => mapping(address => bool)) public whitelisted;
//     mapping(address => uint256[]) public userProjects; // Projects created by user
//     mapping(address => uint256[]) public userInvestments; // Projects invested in by user
    
//     event ProjectCreated(
//         uint256 indexed projectId,
//         address indexed owner,
//         string name,
//         string description,
//         address tokenAddress,
//         uint256 goal,
//         uint256 createdAt
//     );
    
//     event SaleStarted(
//         uint256 indexed projectId,
//         uint256 startTime,
//         uint256 endTime,
//         uint256 tokenPrice
//     );
    
//     event SaleEnded(uint256 indexed projectId, uint256 totalRaised, uint256 goal);
//     event Investment(uint256 indexed projectId, address indexed investor, uint256 amount);
//     event WhitelistUpdated(uint256 indexed projectId, address user, bool status);
//     event TokensClaimed(uint256 indexed projectId, address user, uint256 amount);
//     event StageUpdated(uint256 indexed projectId, SaleStage newStage);
//     event ProjectInfoUpdated(uint256 indexed projectId);

//     constructor() Ownable(msg.sender) {}

//     function createProject(
//         string memory _name,
//         string memory _description,
//         address _tokenAddress,
//         uint256 _goal
//     ) external returns (uint256 projectId) {
//         require(_tokenAddress != address(0), "Invalid token address");
//         require(_goal > 0, "Invalid goal amount");
//         require(bytes(_name).length > 0, "Invalid name");
        
//         projectId = projects.length;
        
//         Project memory newProject = Project({
//             name: _name,
//             description: _description,
//             website: "",
//             whitepaper: "",
//             socialLinks: new string[](0),
//             tokenAddress: _tokenAddress,
//             owner: msg.sender,
//             goal: _goal,
//             totalRaised: 0,
//             startTime: 0,
//             endTime: 0,
//             tokenPrice: 0,
//             active: false,
//             finalized: false,
//             currentStage: SaleStage.PENDING,
//             totalParticipants: 0,
//             minContribution: 0.01 ether,
//             maxContribution: 5 ether
//         });
        
//         projects.push(newProject);
//         userProjects[msg.sender].push(projectId);
        
//         emit ProjectCreated(
//             projectId,
//             msg.sender,
//             _name,
//             _description,
//             _tokenAddress,
//             _goal,
//             block.timestamp
//         );
//     }

//     function updateProjectInfo(
//         uint256 _projectId,
//         string memory _website,
//         string memory _whitepaper,
//         string[] memory _socialLinks
//     ) external {
//         require(_projectId < projects.length, "Invalid project ID");
//         require(projects[_projectId].owner == msg.sender, "Not project owner");
        
//         Project storage project = projects[_projectId];
//         project.website = _website;
//         project.whitepaper = _whitepaper;
//         project.socialLinks = _socialLinks;
        
//         emit ProjectInfoUpdated(_projectId);
//     }

//     function startSale(
//         uint256 _projectId,
//         uint256 _startTime,
//         uint256 _duration,
//         uint256 _tokenPrice
//     ) external {
//         require(_projectId < projects.length, "Invalid project ID");
//         Project storage project = projects[_projectId];
//         require(project.owner == msg.sender, "Not project owner");
//         require(!project.active, "Sale already active");
//         require(_startTime >= block.timestamp, "Invalid start time");
//         require(_duration > 0, "Invalid duration");
//         require(_tokenPrice > 0, "Invalid token price");
        
//         project.active = true;
//         project.startTime = _startTime;
//         project.endTime = _startTime + _duration;
//         project.tokenPrice = _tokenPrice;
//         project.currentStage = SaleStage.WHITELIST;
        
//         emit SaleStarted(_projectId, _startTime, project.endTime, _tokenPrice);
//         emit StageUpdated(_projectId, SaleStage.WHITELIST);
//     }

//     function setStage(uint256 _projectId, SaleStage _stage) external {
//         require(_projectId < projects.length, "Invalid project ID");
//         Project storage project = projects[_projectId];
//         require(project.owner == msg.sender, "Not project owner");
//         require(_stage != SaleStage.PENDING, "Cannot set to pending");
//         require(_stage != project.currentStage, "Already in this stage");
        
//         project.currentStage = _stage;
//         emit StageUpdated(_projectId, _stage);
//     }

//     function updateWhitelist(uint256 _projectId, address[] calldata _users, bool _status) external {
//         require(_projectId < projects.length, "Invalid project ID");
//         require(projects[_projectId].owner == msg.sender, "Not project owner");
        
//         for(uint i = 0; i < _users.length; i++) {
//             whitelisted[_projectId][_users[i]] = _status;
//             emit WhitelistUpdated(_projectId, _users[i], _status);
//         }
//     }

//     function invest(uint256 _projectId) external payable nonReentrant whenNotPaused {
//         require(_projectId < projects.length, "Invalid project ID");
//         Project storage project = projects[_projectId];
        
//         require(project.active && !project.finalized, "Not active");
//         require(block.timestamp >= project.startTime && block.timestamp <= project.endTime, "Not in sale period");
//         require(project.currentStage != SaleStage.PENDING, "Sale not started");
//         require(project.currentStage != SaleStage.ENDED, "Sale ended");
        
//         if(project.currentStage == SaleStage.WHITELIST) {
//             require(whitelisted[_projectId][msg.sender], "Not whitelisted");
//         }
        
//         require(msg.value >= project.minContribution, "Below min contribution");
//         require(msg.value <= project.maxContribution, "Exceeds max contribution");
//         require(contributions[_projectId][msg.sender] + msg.value <= project.maxContribution, "Would exceed max contribution");
        
//         if(contributions[_projectId][msg.sender] == 0) {
//             project.totalParticipants++;
//             userInvestments[msg.sender].push(_projectId);
//         }
        
//         contributions[_projectId][msg.sender] += msg.value;
//         project.totalRaised += msg.value;
        
//         emit Investment(_projectId, msg.sender, msg.value);
//     }

//     function finalizeSale(uint256 _projectId) external {
//         require(_projectId < projects.length, "Invalid project ID");
//         Project storage project = projects[_projectId];
//         require(project.owner == msg.sender, "Not project owner");
//         require(project.active, "Sale not active");
//         require(block.timestamp >= project.endTime || project.totalRaised >= project.goal, "Cannot end yet");
//         require(!project.finalized, "Already finalized");
        
//         project.active = false;
//         project.finalized = true;
//         project.currentStage = SaleStage.ENDED;
        
//         if (project.totalRaised >= project.goal) {
//             payable(project.owner).transfer(project.totalRaised);
//         }
        
//         emit SaleEnded(_projectId, project.totalRaised, project.goal);
//         emit StageUpdated(_projectId, SaleStage.ENDED);
//     }

//     function claimTokens(uint256 _projectId) external nonReentrant {
//         require(_projectId < projects.length, "Invalid project ID");
//         Project storage project = projects[_projectId];
//         require(project.finalized, "Sale not finalized");
//         require(project.totalRaised >= project.goal, "Goal not reached");
//         require(contributions[_projectId][msg.sender] > 0, "No contribution");
        
//         uint256 contribution = contributions[_projectId][msg.sender];
//         uint256 tokenAmount = (contribution * 10**18) / project.tokenPrice;
//         contributions[_projectId][msg.sender] = 0;
        
//         require(IERC20(project.tokenAddress).transfer(msg.sender, tokenAmount), "Token transfer failed");
//         emit TokensClaimed(_projectId, msg.sender, tokenAmount);
//     }

//     function refund(uint256 _projectId) external nonReentrant {
//         require(_projectId < projects.length, "Invalid project ID");
//         Project storage project = projects[_projectId];
//         require(project.finalized, "Sale not finalized");
//         require(project.totalRaised < project.goal, "Goal was reached");
//         require(contributions[_projectId][msg.sender] > 0, "No contribution");
        
//         uint256 amount = contributions[_projectId][msg.sender];
//         contributions[_projectId][msg.sender] = 0;
//         payable(msg.sender).transfer(amount);
//     }

//     function setContributionLimits(uint256 _projectId, uint256 _min, uint256 _max) external {
//         require(_projectId < projects.length, "Invalid project ID");
//         require(projects[_projectId].owner == msg.sender, "Not project owner");
//         require(_min < _max, "Invalid limits");
        
//         Project storage project = projects[_projectId];
//         project.minContribution = _min;
//         project.maxContribution = _max;
//     }

//     // View functions
//     function getProject(uint256 _projectId) external view returns (Project memory) {
//         require(_projectId < projects.length, "Invalid project ID");
//         return projects[_projectId];
//     }

//     function getUserProjects(address _user) external view returns (uint256[] memory) {
//         return userProjects[_user];
//     }

//     function getUserInvestments(address _user) external view returns (uint256[] memory) {
//         return userInvestments[_user];
//     }

//     function getProjectCount() external view returns (uint256) {
//         return projects.length;
//     }

//     function pause() external onlyOwner {
//         _pause();
//     }

//     function unpause() external onlyOwner {
//         _unpause();
//     }
// }