export let ShardFeatureClaimPoll = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "sid",
				"type": "uint256"
			},
			{
				"internalType": "address[]",
				"name": "_claims",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "fids",
				"type": "uint256[]"
			}
		],
		"name": "lastClaimBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "times",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]