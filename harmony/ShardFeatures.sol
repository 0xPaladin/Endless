// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;


interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
}
interface IStats {
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function sub (string calldata statId, address _721, uint256 nftId, uint256 val) external;
}
interface ISize {
    function size(address nft, uint256 id) external view returns (uint256 sz, uint256 nR, uint256 nF);
}

contract ShardFeatures {
    address public admin;
    
    //contracts 
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    ISize public SIZE = ISize(0xAA6411a301A6e423f5eb9b1bF455CeBD0B2d2098);

    uint256[12] internal ALIGNMENT = [0,1,1,2,2,2,2,2,2,3,3,4];
    uint256[5] internal ALIGNMENT_MOD = [8,10,5,0,2];
    uint256[22] internal SAFETY = [3,3,3,3,3,3,2,2,1,1,1,1,1,1,1,0,0,0,0,0,0,0];
    
    uint256[11] internal FEATURESTEPS = [40,50,60,75,79,83,87,91,95,100,110];
    string[12] internal FEATURENAMES = ["creature","hazard","obstacle","area","dungeon","lair","ruin","outpost","landmark","resource","faction","settlement"];

    constructor() {
        admin = msg.sender;
    }

    //psuedo random integer 
    function _integer (bytes32 _hash, uint256 max) 
        internal pure returns (uint256)
    {
        return uint256(_hash) % max;
    }

    //hash makes each shard unique 
    function hash (address nft, uint256 id)
        public pure returns (bytes32) 
    {
        return keccak256(abi.encode("But God...",nft,id));
    }
    
    /*
    *   Feature Generator  
    */
    
    //determines alignment and then safety 
    function safety (address nft, uint256 id) 
        public view returns (uint256 align, uint256 safe)
    {
        //based on generation 
        bytes32 _hash = hash(nft,id);
        align = ALIGNMENT[_integer(keccak256(abi.encode(_hash,"alignment")), 12)];
        
        uint256 safeRoll = ALIGNMENT_MOD[align] + _integer(keccak256(abi.encode(_hash,"safety")), 12);
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
        uint256 r = fi < 2 ? [1,65][fi] : 1 + _integer(_baseHash, 120) + (10 * safe);
        
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
    
    /*
    *   Claim Features 
    */
    
    //pay to claim 
    string internal PAYID = "SRD.COSMIC";
    uint256 internal COST = 1 ether;
    
    //what may be claimed 
    mapping (uint256 => bytes) internal _claimWhat;
    
    //claim once per day 
    uint256 internal PERIOD = 1 days;
    mapping (bytes32 => uint256) public lastClaim;
    
    //admin set what may be claimed 
    function setClaims (uint256 ci, string[] calldata stats, uint256[] calldata min, uint256[] calldata max) 
        public
    {
        require(msg.sender == admin, "ShardFeatures: must be admin to set claims");
        
        _claimWhat[ci] = abi.encode(stats,min,max);
    }
    
    //unique id for each claim for traking time 
    function _claimId (address nft, uint256 id, uint256 fi) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(nft, id, fi));
    }
    
    //check for approval 
    function _isApprovedOrOwner(address nft, uint256 id) internal view returns (bool) {
        return IERC721(nft).getApproved(id) == msg.sender || IERC721(nft).ownerOf(id) == msg.sender;
    }
    
    function _mayClaim (address nft, uint256 id, uint256 fi) 
        internal returns (bytes[] memory stats, uint256[] memory min, uint256[] memory max)
    {
        require(_isApprovedOrOwner(nft, id), "ShardFeatures: not approved or owner");
        
        //get feature 
        (uint256 _fid, bytes32 hash) = featureByIndex(nft, id, fi);
        require(hash != bytes32(0), "ShardFeatures: beyond available features");
        require(_claimWhat[_fid] != bytes(0), "ShardFeatures: incorrect feature type for cliam");
        
        //claim period 
        bytes32 _claim = _claimId(nft,id,fi);
        uint256 _now = block.timestamp; 
        require((_now - lastClaim[_claim]) >= PERIOD, "FeatureClaim: wait one day to claim");
        //update claim 
        lastClaim[_claim] = _now;
        
        //cleared all require, now pull payment 
        //subtract - will throw a error if not enough 
        STATS.sub(PAYID, nft, id, COST);
        
        (stats, min, max) = abi.decode(_claimWhat[_fid], (bytes[], uint256[], uint256[]));
    }
    
    function _delta (uint256 min, uint256 max) 
        internal pure returns (uint256 val)
    {
        //for pseudo random delta
        bytes32 rand = keccak256(abi.encode(blockhash(block.number-1), block.timestamp, msg.sender, "delta"));
        uint256 r = 0;
        for(uint256 i = 0; i < 3; i++){
            r += _integer(keccak256(abi.encode(rand,i)),6);
        }
        
        //always use 3d6 for variance 
        uint256 d = max-min;
        val = min + (d * r / 15);
    } 

    function claim (address nft, uint256 id, uint256 fi) 
        public 
    {
        //check allow claim - and collect payment  
        (string[] memory stats, uint256[] memory min, uint256[] memory max) = _mayClaim(nft, id, fi);
        
        //determine which is claimed 
        uint256 _ci = _integer(keccak256(abi.encode(blockhash(block.number-1), block.timestamp, msg.sender, "claim")), stats.length); 
        uint256 val = _delta(min[_ci],max[_ci]);
        
        //give token 
        STATS.add(CLAIMID[_ci], nft, id, amt);
    }
}