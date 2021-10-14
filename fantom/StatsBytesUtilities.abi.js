export let StatsBytesUtilities = [
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
				"internalType": "bytes[]",
				"name": "vals",
				"type": "bytes[]"
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
				"internalType": "bytes[]",
				"name": "vals",
				"type": "bytes[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]