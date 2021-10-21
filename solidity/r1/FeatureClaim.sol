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

contract FeatureClaim {
    //contracts 
    ISeededRandom public RND = ISeededRandom(0xe876c509705Da5E21738b8c5F4399861ad2432D0);
    IFeature public FEATURES = IFeature(0x47eC56991f0E456593b7F26897C44b72617C77C4);
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    
    //feature id 
    uint256 internal constant FID = 1;
    
    //pay to claim 
    string[1] internal PAYID = ["SRD.COSMIC"];
    uint256[1] internal COST = [1];
    
    //what they are claiming 
    string[1] internal CLAIMID = ["SRD.WAY"];
    uint256[1] internal MIN = [1000];
    uint256[3][1] DICE = [[0,1,1]];
    
    function _isApprovedOrOwner(address nft, uint256 id) internal view returns (bool) {
        return IERC721(nft).getApproved(id) == msg.sender || IERC721(nft).ownerOf(id) == msg.sender;
    }
    
    function _mayClaim (address nft, uint256 id, uint256 fi, uint256 opt) 
        internal 
    {
        require(_isApprovedOrOwner(nft, id), "FeatureClaim: not approved or owner");
        
        //get feature 
        (uint256 fid, bytes32 hash) = FEATURES.featureByIndex(nft, id, fi);
        require(hash != bytes32(0), "FeatureClaim: beyond available features");
        require(fid == FID, "FeatureClaim: incorrect feature type for cliam");
        
        //cleared all require, now pull payment 
        //subtract - will throw a error if not enough 
        STATS.sub(PAYID[opt], nft, id, COST[opt]);
    }
    
    function _delta (uint256 opt) 
        internal view returns (uint256 d)
    {
        //no dice variance - return 0 delta 
        if(DICE[opt][0] == 0){
            return 0;
        }
        
        //for random delta
        bytes32 rand = keccak256(abi.encode(blockhash(block.number-1), block.timestamp, msg.sender));
        //use dice 
        (,d) = RND.dice(rand, DICE[opt][1], DICE[opt][2]);
    } 

    function claim (address nft, uint256 id, uint256 fi, uint256 opt) 
        public 
    {
        //check allow claim - and collect payment  
        _mayClaim(nft, id, fi, opt);
        
        //get amt to reward 
        uint256 amt = MIN[opt] + _delta(opt);
        
        //give token 
        STATS.add(CLAIMID[opt], nft, id, amt);
    }    
}