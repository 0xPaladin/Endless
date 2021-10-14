export let ERC721Utilities = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "stats",
				"type": "address"
			},
			{
				"internalType": "string[]",
				"name": "statIds",
				"type": "string[]"
			},
			{
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getBatchOfStats",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "vals",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "getNFTIdBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "stats",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "statId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			}
		],
		"name": "getStatsOfIdBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "vals",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]