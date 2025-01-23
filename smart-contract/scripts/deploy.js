const hre = require("hardhat");

async function main() {
  console.log("Deploying NewLaunchpad...");

  const NewLaunchpad = await hre.ethers.getContractFactory("NewLaunchpad");
  const launchpad = await NewLaunchpad.deploy();
  await launchpad.waitForDeployment();

  const launchpadAddress = await launchpad.getAddress();
  console.log("NewLaunchpad deployed to:", launchpadAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Deployment verification commands
// const verificationCommands = `
// // After deployment, verify contracts on Etherscan:

// npx hardhat verify --network mainnet LAUNCH_TOKEN_ADDRESS "Launch Platform Token" "LPT" 18 "1000000000000000000000000" DEPLOYER_ADDRESS

// npx hardhat verify --network mainnet LAUNCH_FACTORY_ADDRESS LAUNCH_TOKEN_ADDRESS

// // Note: LaunchPad contracts created through factory don't need manual verification
// `;

// console.log("\nVerification Commands:", verificationCommands);
