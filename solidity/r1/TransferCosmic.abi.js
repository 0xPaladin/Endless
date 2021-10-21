export let TransferCosmic = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "from",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "to",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "val",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "RND",
		"outputs": [
			{
				"internalType": "contract ISeededRandom",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "STATID",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "STATS",
		"outputs": [
			{
				"internalType": "contract IStats",
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
				"internalType": "address",
				"name": "fromNFT",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "fromId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "toNFT",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "toId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "val",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]