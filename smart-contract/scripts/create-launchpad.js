const hre = require("hardhat");
require('dotenv').config();

async function main() {
  // Get the factory contract at the deployed address
  const factoryAddress = process.env.LAUNCH_FACTORY_ADDRESS;
  const LaunchFactory = await hre.ethers.getContractFactory("LaunchFactory");
  const factory = LaunchFactory.attach(factoryAddress);

  // Create a new LaunchPad
  const tx = await factory.createLaunchPad(
    "My Launch",
    "Description of my launch",
    hre.ethers.parseEther("100") // 100 ETH goal
  );

  // Wait for the transaction to be mined
  const receipt = await tx.wait();

  // Get the LaunchPad address from the event
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === "LaunchPadCreated"
  );
  const launchPadAddress = event.args[0];

  console.log("New LaunchPad created at:", launchPadAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 