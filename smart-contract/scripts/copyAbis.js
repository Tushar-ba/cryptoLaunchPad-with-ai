const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '../artifacts/contracts');
const abiDir = path.join(__dirname, '../../frontend/src/abi');

// Create abi directory if it doesn't exist
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

// Contracts to copy
const contracts = ['LaunchPad', 'LaunchToken', 'LaunchFactory'];

contracts.forEach(contractName => {
  const contractArtifactPath = path.join(
    contractsDir,
    `${contractName}.sol/${contractName}.json`
  );
  
  if (fs.existsSync(contractArtifactPath)) {
    const artifact = require(contractArtifactPath);
    const abiPath = path.join(abiDir, `${contractName}.json`);
    
    // Write only the ABI to the frontend directory
    fs.writeFileSync(
      abiPath,
      JSON.stringify(artifact.abi, null, 2)
    );
    
    console.log(`Copied ${contractName} ABI to frontend`);
  } else {
    console.error(`Contract artifact not found: ${contractName}`);
  }
}); 