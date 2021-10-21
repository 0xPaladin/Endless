export let ShardFeatures = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "fi",
				"type": "uint256"
			}
		],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "ci",
				"type": "uint256"
			},
			{
				"internalType": "string[]",
				"name": "stats",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "min",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "max",
				"type": "uint256[]"
			}
		],
		"name": "setClaims",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "admin",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "fi",
				"type": "uint256"
			}
		],
		"name": "featureByIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "what",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "fHash",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "hash",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "lastClaim",
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
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "safety",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "align",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "safe",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SHARDS",
		"outputs": [
			{
				"internalType": "contract IERC721",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SIZE",
		"outputs": [
			{
				"internalType": "contract ISize",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]