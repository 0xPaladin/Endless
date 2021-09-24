export let FeatureLastClaimPoll = [
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "ids",
				"type": "bytes32[]"
			},
			{
				"internalType": "address[]",
				"name": "claims",
				"type": "address[]"
			}
		],
		"name": "lastClaimBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "lastClaims",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]