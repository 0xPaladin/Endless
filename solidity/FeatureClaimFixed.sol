// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface ISeededRandom {
    function integer (bytes32 hash, uint256 max) external pure returns (uint256);
    function dice (bytes32 hash, uint256 n, uint256 d) external pure returns (uint256[] memory r, uint256 sum);
}
interface IFeature {
    function featureByIndex (address nft, uint256 id, uint256 fi) external view returns (uint256 what, bytes32 fHash);
}
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
}
interface IStats {
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function sub (string calldata statId, address _721, uint256 nftId, uint256 val) external;
}

contract FeatureClaimFixed {
    //contracts 
    ISeededRandom public RND = ISeededRandom(0xe876c509705Da5E21738b8c5F4399861ad2432D0);
    IFeature public FEATURES = IFeature(0x47eC56991f0E456593b7F26897C44b72617C77C4);
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    
    //feature id 
    uint256 internal constant FID = 1;
    
    //pay to claim 
    string internal PAYID = "SRD.COSMIC";
    uint256 internal COST = 1 ether;
    
    //what they are claiming 
    string internal CLAIMID = "SRD.COSMIC";
    uint256 internal MIN = 0;
    uint256[3] internal DICE = [1,1,3];
    uint256 internal MULTI = 1 ether;
    
    //claim once per day 
    uint256 internal PERIOD = 1 days;
    mapping (bytes32 => uint256) public lastClaim;
    
    function _claimId (address nft, uint256 id, uint256 fi) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(nft, id, fi));
    }
    
    function _isApprovedOrOwner(address nft, uint256 id) internal view returns (bool) {
        return IERC721(nft).getApproved(id) == msg.sender || IERC721(nft).ownerOf(id) == msg.sender;
    }
    
    function _mayClaim (address nft, uint256 id, uint256 fi) 
        internal 
    {
        require(_isApprovedOrOwner(nft, id), "FeatureClaim: not approved or owner");
        
        //get feature 
        (uint256 fid, bytes32 hash) = FEATURES.featureByIndex(nft, id, fi);
        require(hash != bytes32(0), "FeatureClaim: beyond available features");
        require(fid == FID, "FeatureClaim: incorrect feature type for cliam");
        
        //claim period 
        bytes32 _claim = _claimId(nft,id,fi);
        uint256 _now = block.timestamp; 
        require((_now - lastClaim[_claim]) >= PERIOD, "FeatureClaim: wait one day to claim");
        //update claim 
        lastClaim[_claim] = _now;
        
        //cleared all require, now pull payment 
        //subtract - will throw a error if not enough 
        STATS.sub(PAYID, nft, id, COST);
    }
    
    function _delta () 
        internal view returns (uint256 d)
    {
        //no dice variance - return 0 delta 
        if(DICE[0] == 0){
            return 0;
        }
        
        //for random delta
        bytes32 rand = keccak256(abi.encode(blockhash(block.number-1), block.timestamp, msg.sender));
        //use dice 
        (,d) = RND.dice(rand, DICE[1], DICE[2]);
    } 

    function claim (address nft, uint256 id, uint256 fi) 
        public 
    {
        //check allow claim - and collect payment  
        _mayClaim(nft, id, fi);
        
        //get amt to reward 
        uint256 amt = (MIN + _delta()) * MULTI;
        
        //give token 
        STATS.add(CLAIMID, nft, id, amt);
    }    
}