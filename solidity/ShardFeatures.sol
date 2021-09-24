// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface ISeededRandom {
    function integer (bytes32 hash, uint256 max) external pure returns (uint256);
}
interface IShardSize {
    function size(address nft, uint256 id) external view returns (uint256 sz, uint256 nR, uint256 nF);
}
interface IStats {
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
}

contract ShardFeatures {
    //contracts 
    ISeededRandom public RND = ISeededRandom(0xe876c509705Da5E21738b8c5F4399861ad2432D0);
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    IShardSize public SIZE = IShardSize(0xAA6411a301A6e423f5eb9b1bF455CeBD0B2d2098);

    uint256[12] internal ALIGNMENT = [0,1,1,2,2,2,2,2,2,3,3,4];
    uint256[5] internal ALIGNMENT_MOD = [8,10,5,0,2];
    uint256[22] internal SAFETY = [3,3,3,3,3,3,2,2,1,1,1,1,1,1,1,0,0,0,0,0,0,0];
    
    uint256[11] internal FEATURESTEPS = [40,50,60,75,79,83,87,91,95,100,110];
    string[12] internal FEATURENAMES = ["creature","hazard","obstacle","area","dungeon","lair","ruin","outpost","landmark","resource","faction","settlement"];

    function hash (address nft, uint256 id)
        public view returns (bytes32) 
    {
        uint256 _stat = STATS.getStat("HASH", nft, id);
        return _stat != 0 ? bytes32(_stat) : keccak256(abi.encode("But God...",nft,id));
    }
    
    function culture (address nft, uint256 id) 
        public view returns (bytes32)
    {
        //based on generation 
        return keccak256(abi.encode(hash(nft,id),"culture"));
    }
    
    function safety (address nft, uint256 id) 
        public view returns (uint256 align, uint256 safe)
    {
        //based on generation 
        bytes32 _hash = hash(nft,id);
        align = ALIGNMENT[RND.integer(keccak256(abi.encode(_hash,"alignment")), 12)];
        
        uint256 safeRoll = ALIGNMENT_MOD[align] + RND.integer(keccak256(abi.encode(_hash,"safety")), 12);
        safe = SAFETY[safeRoll];
    }
    
    //feature based on number  
    function featureByIndex (address nft, uint256 id, uint256 fi) 
        public view returns (uint256 what, bytes32 fHash)
    {
        //current size 
        (, , uint256 nF) = SIZE.size(nft, id);
        //return 0 if outside of feature range 
        if(fi >= nF){
            return (0, bytes32(0));
        }
        
        //base hash for generation 
        bytes32 _hash = hash(nft,id);
        bytes32 _baseHash = keccak256(abi.encode(_hash,"feature",fi));

        //get safety
        (,uint256 safe) = safety(nft, id);
        
        //first 2 are set - otherwise random number 
        uint256 r = fi < 2 ? [1,65][fi] : 1 + RND.integer(_baseHash, 120) + (10 * safe);
        
        //start at max 
        what = 11;
        for(uint256 i = 0; i < 11; i++){
            if(r <= FEATURESTEPS[i]){
                what = i;
                break;
            }
        }
        
        fHash = keccak256(abi.encode(_baseHash, FEATURENAMES[what]));
    }
}