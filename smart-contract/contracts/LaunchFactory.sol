
// pragma solidity 0.8.27;
// import './LaunchToken.sol';
// import './LaunchPad.sol';

// contract LaunchFactory {
//     struct LaunchPadInfo {
//         address launchPadAddress;
//         address owner;
//         string name;
//         string description;
//         uint256 goal;
//         bool active;
//         uint256 createdAt;
//     }

//     LaunchPadInfo[] public launchPads;
//     address public launchToken;

//     mapping(address => bool) public isLaunchPad;
//     mapping(address => LaunchPadInfo[]) public userLaunchPads;
    
//     event LaunchPadCreated(
//         address launchPad,
//         address creator,
//         string name,
//         string description,
//         uint256 goal,
//         uint256 createdAt
//     );
    
//     event LaunchTokenCreated(
//         address launchToken,
//         address creator,
//         string name,
//         string symbol,
//         uint8 decimals,
//         uint256 initialSupply
//     );

//     constructor(address _launchToken) {
//         require(_launchToken != address(0), "Invalid token address");
//         launchToken = _launchToken;
//     }

//     function createLaunchPad(
//         address _token,
//         string memory _name,
//         string memory _description,
//         uint256 _goal
//     ) public {
//         require(_token != address(0), "Invalid token address");
        
//         address launchPad = address(new LaunchPad(
//             _token,
//             _name,
//             _description,
//             _goal,
//             msg.sender
//         ));
        
//         LaunchPadInfo memory newPad = LaunchPadInfo({
//             launchPadAddress: launchPad,
//             owner: msg.sender,
//             name: _name,
//             description: _description,
//             goal: _goal,
//             active: true,
//             createdAt: block.timestamp
//         });
        
//         launchPads.push(newPad);
//         userLaunchPads[msg.sender].push(newPad);
//         isLaunchPad[launchPad] = true;

//         emit LaunchPadCreated(
//             launchPad,
//             msg.sender,
//             _name,
//             _description,
//             _goal,
//             block.timestamp
//         );
//     }

//     function createLaunchToken(
//         string memory _name,
//         string memory _symbol,
//         uint8 _decimals,
//         uint256 _initialSupply
//     ) public returns (address) {
//         address token = address(new LaunchToken(
//             _name,
//             _symbol,
//             _decimals,
//             _initialSupply,
//             msg.sender
//         ));
        
//         emit LaunchTokenCreated(
//             token,
//             msg.sender,
//             _name,
//             _symbol,
//             _decimals,
//             _initialSupply
//         );
        
//         return token;
//     }

//     function getAllLaunchPads() external view returns (LaunchPadInfo[] memory) {
//         return launchPads;
//     }

//     function getUserLaunchPads(address _user) external view returns (LaunchPadInfo[] memory) {
//         return userLaunchPads[_user];
//     }

//     function getLaunchPadCount() external view returns (uint256) {
//         return launchPads.length;
//     }
// }