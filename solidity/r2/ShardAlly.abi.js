export let ShardAlly = [
	{
		"inputs": [],
		"name": "ALLY",
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
		"name": "FEATURES",
		"outputs": [
			{
				"internalType": "contract IFeature",
				"name": "",
				"type": "address"
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "base",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "seed",
				"type": "uint256"
			}
		],
		"name": "SizeAndNApp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "size",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "napp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			}
		],
		"name": "baseCulture",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "allyId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "form",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "culture",
				"type": "bytes32"
			}
		],
		"name": "baseStats",
		"outputs": [
			{
				"internalType": "uint256[6]",
				"name": "stats",
				"type": "uint256[6]"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "featureHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "allyId",
				"type": "bytes32"
			}
		],
		"name": "baseStatsFromAlly",
		"outputs": [
			{
				"internalType": "uint256[6]",
				"name": "stats",
				"type": "uint256[6]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_shard",
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
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			}
		],
		"name": "lifeform",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "base",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "seed",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "base",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "seed",
				"type": "uint256"
			}
		],
		"name": "lifeformHash",
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
				"internalType": "address",
				"name": "_nft",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "nftHash",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			}
		],
		"name": "statMods",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "b",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "p",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	}
]