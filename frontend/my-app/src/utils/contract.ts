import { ethers } from 'ethers';

// You'll need to add your contract ABI here
export const LAUNCHPAD_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_investor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokenSupply",
        "type": "uint256"
      }
    ],
    "name": "Invested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prjectId",
        "type": "uint256"
      }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "goal",
        "type": "uint256"
      }
    ],
    "name": "projectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_supply",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_token",
        "type": "address"
      }
    ],
    "name": "tokensMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_investor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_token",
        "type": "address"
      }
    ],
    "name": "tokensTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "AMOUNT_INVESTED",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      }
    ],
    "name": "Invest",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PROJECTID",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_initialSupply",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "goal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fixedInvest",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_minimumpay",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_sendingTokensToSender",
        "type": "uint256"
      }
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_of",
        "type": "address"
      }
    ],
    "name": "getInvestors",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "projectId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "investor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenSupply",
            "type": "uint256"
          }
        ],
        "internalType": "struct NewLaunchpad.Investment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      }
    ],
    "name": "getProject",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "projectId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "goal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "fixedInvest",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalCollected",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "fundingPeriodStart",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "fundingPeriodEnd",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalInvestors",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "tokenContractAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "canStillFund",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "minimumpay",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "sendingTokensToSender",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalWithdrawable",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct NewLaunchpad.Project",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "investment",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "investor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tokenSupply",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      }
    ],
    "name": "isProjectActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "project",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "goal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fixedInvest",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalCollected",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fundingPeriodStart",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fundingPeriodEnd",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalInvestors",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "tokenContractAddress",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "canStillFund",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "minimumpay",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "sendingTokensToSender",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWithdrawable",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      }
    ],
    "name": "withdrawFunding",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
export const LAUNCHPAD_ADDRESS = "0xE94A37Da65Cc76990fb27af03B0826B6771EeF8e";

export const getLaunchpadContract = (signer: any) => {
    // Create provider with ENS disabled
    const provider = new ethers.providers.Web3Provider(window.ethereum, {
        name: "any",
        chainId: parseInt(window.ethereum.networkVersion),
        ensAddress: null
    });

    return new ethers.Contract(
        LAUNCHPAD_ADDRESS,
        LAUNCHPAD_ABI,
        signer || provider.getSigner()
    );
};