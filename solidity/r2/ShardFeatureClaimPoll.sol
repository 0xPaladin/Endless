// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IClaim {
    function lastClaim(bytes32 id) external view returns (uint256 time);
}

//useful for reducing API calls 
contract ShardFeatureClaimPoll {
    
    //unique id for each claim for traking time 
    function _claimId (uint256 id, uint256 fi) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(id, fi));
    }

    //gets a batch of stats from an id  
    function lastClaimBatch (uint256 sid, address[] calldata _claims, uint256[] calldata fids) 
        public view returns (uint256[] memory times)
    {
        times = new uint256[](fids.length);
        
        for(uint256 i = 0; i < fids.length; i++) {
            times[i] = IClaim(_claims[i]).lastClaim(_claimId(sid,fids[i]));
        }
    }
}