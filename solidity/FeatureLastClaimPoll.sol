// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IFeatureClaim {
    function lastClaim (bytes32 id) external view returns (uint256);
}

contract FeatureLastClaimPoll {

    //look for the last claims of one nft id 
    function lastClaimBatch (bytes32[] calldata ids, address[] calldata claims) 
        public view returns(uint256[] memory lastClaims) 
    {
        uint256 l = claims.length;
        lastClaims = new uint256[](l);
        for(uint256 i = 0; i < l; i++){
            lastClaims[i] = IFeatureClaim(claims[i]).lastClaim(ids[i]);
        }
    }
}