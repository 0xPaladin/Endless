// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

contract SeededRandom {
    
    function integer (bytes32 hash, uint256 max)
        public pure returns (uint256)
    {
        return uint256(hash) % max;
    }
    
    function dice (bytes32 hash, uint256 n, uint256 d)
        public pure returns (uint256[] memory r, uint256 sum)
    {
        r = new uint256[](n);
        for(uint256 i = 0; i < n; i++){
            bytes32 rHash = keccak256(abi.encode(hash, i));
            r[i] = 1 + integer(rHash, d);
            sum += r[i];
        }
    }
    
    function pickone (bytes32 hash, uint256[] memory arr)
        public pure returns (uint256 val)
    {
        uint256 i = integer(hash, arr.length);
        val = arr[i];
    }
    
    function shuffle (bytes32 hash, uint256[] memory arr)
        public pure returns (uint256[] memory res)
    {
        uint256 l = arr.length;
        res = new uint256[](l);
        
        //clone arr
        for(uint256 i = 0; i < l; i++){
            res[i] = arr[i];
        }
        
        //swap 
        bytes32 _hash;
        uint256 j;
        uint256 val;
        for(uint256 i = 0; i < l; i++){
            _hash = keccak256(abi.encode(hash, i));
            j = integer(_hash, i+1);
            val = res[i];
            res[i] = res[j];
            res[j] = val;
        }
    }
    
    function weighted (bytes32 hash, uint256[] memory arr, uint256[] memory p)
        public pure returns (uint256 res)
    {
        uint256 l = arr.length;
        require(l == p.length, "SeededRandom: array length mismatch");
        
        //sum array 
        uint256[] memory pSum = new uint256[](l);
        for(uint256 i = 0; i < l; i++){
            pSum[i] = p[i] + (i==0 ? 0 : pSum[i-1]);
        }
        
        uint256 rand = integer(hash, pSum[l-1]);
        for(uint256 i = 0; i < l; i++){
            if(rand <= pSum[i]){
                res = arr[i];
                break;
            }
        }
    }
}

contract MakeHash {
    function randHash (string memory seed) 
        public view returns (bytes32)
    {
        return keccak256(abi.encode(seed,block.timestamp));
    }
}