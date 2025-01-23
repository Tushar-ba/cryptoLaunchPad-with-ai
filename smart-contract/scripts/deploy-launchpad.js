const hre = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("Deploying LaunchPad for testing...");

  // First deploy LaunchToken since LaunchPad needs it
  const LaunchToken = await hre.ethers.getContractFactory("LaunchToken");
  const launchToken = await LaunchToken.deploy(
    "Test Token",
    "TEST",
    18,
    1000000,
    await hre.ethers.provider.getSigner().getAddress()
  );
  await launchToken.waitForDeployment();
  const launchTokenAddress = await launchToken.getAddress();
  console.log("LaunchToken deployed to:", launchTokenAddress);

  // Deploy LaunchPad directly
  const LaunchPad = await hre.ethers.getContractFactory("LaunchPad");
  const launchPad = await LaunchPad.deploy(
    launchTokenAddress,                                    // _launchToken
    "Test Launch",                                        // _name
    "This is a test launchpad deployment",               // _description
    hre.ethers.parseEther("100"),                        // _goal (100 ETH)
    await hre.ethers.provider.getSigner().getAddress()   // _owner
  );

  await launchPad.waitForDeployment();
  const launchPadAddress = await launchPad.getAddress();
  console.log("LaunchPad deployed to:", launchPadAddress);

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await launchPad.deploymentTransaction().wait(5);

  // Verify contracts on Etherscan
  console.log("\nVerifying contracts on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: launchPadAddress,
      constructorArguments: [
        launchTokenAddress,
        "Test Launch",
        "This is a test launchpad deployment",
        hre.ethers.parseEther("100"),
        await hre.ethers.provider.getSigner().getAddress()
      ],
    });

    console.log("LaunchPad verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }

  // Print deployment summary
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("LaunchToken:", launchTokenAddress);
  console.log("LaunchPad:", launchPadAddress);
}

// Handle errors in main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 