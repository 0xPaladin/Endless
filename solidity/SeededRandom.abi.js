export let SeededRandom = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "d",
				"type": "uint256"
			}
		],
		"name": "dice",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "r",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "sum",
				"type": "uint256"
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
			},
			{
				"internalType": "uint256",
				"name": "max",
				"type": "uint256"
			}
		],
		"name": "integer",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
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
			},
			{
				"internalType": "uint256[]",
				"name": "arr",
				"type": "uint256[]"
			}
		],
		"name": "pickone",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "val",
				"type": "uint256"
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
			},
			{
				"internalType": "uint256[]",
				"name": "arr",
				"type": "uint256[]"
			}
		],
		"name": "shuffle",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "res",
				"type": "uint256[]"
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
			},
			{
				"internalType": "uint256[]",
				"name": "arr",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "p",
				"type": "uint256[]"
			}
		],
		"name": "weighted",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "res",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	}
]