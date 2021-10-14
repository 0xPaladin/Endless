// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IFeature {
    function featureByIndex (address nft, uint256 id, uint256 fi) external view returns (uint256 what, bytes32 fHash);
}
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
    function totalSupply() external returns (uint256);
    function mint(address to) external;
}
interface IStatsBytes {
    function setStat (string calldata statId, address _721, uint256 nftId, bytes memory val) external;
}
interface IStats {
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function sub (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function setStat (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
}
interface IAllyBasic {
    function baseStatsFromAlly (bytes32 featureHash, bytes32 allyId) external view returns (uint256[6] memory stats);
    function baseCulture (bytes32 ally) external pure returns (bytes32);
    function SizeAndNApp (uint256 base, uint256 seed) external view returns (uint256 size, uint256 napp);
    function lifeformHash (uint256 base, uint256 seed) external view returns (bytes32);
    function lifeform (bytes32 hash) external pure returns (uint256 base, uint256 seed); 
}


contract FeatureClaimAlly {
    //contracts 
    IFeature public FEATURES = IFeature(0x47eC56991f0E456593b7F26897C44b72617C77C4);
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    IStatsBytes public STATSBYTES = IStatsBytes(0x0382b163D4B46999660d5AD85Fdc0f3fB5Eb9541);
    IAllyBasic public ALLY = IAllyBasic(0xD8DCB29D2138f4dAf50A0d184428cE9cf1F17700);
    IERC721 public NFTALLY = IERC721(0xAe1Ad876f3759eaBcc04733ce32918cBEC5218B5);
    
    //feature id 
    uint256 internal constant FID = 0;
    
    //pay to claim 
    string internal PAYID = "SRD.COSMIC";
    uint256 internal COST = 1 ether;
    uint256[3] internal COSTM = [10,5,3];
    
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
    
    function _nftHash (address nft, uint256 id)
        internal view returns (bytes32) 
    {
        uint256 _stat = STATS.getStat("HASH", nft, id);
        return _stat != 0 ? bytes32(_stat) : keccak256(abi.encode("But God...",nft,id));
    }
    
    function _mayClaim (address nft, uint256 id, uint256 fi) 
        internal
    {
        require(_isApprovedOrOwner(nft, id), "FeatureClaim: not approved or owner");
        
        //claim period 
        bytes32 _claim = _claimId(nft,id,fi);
        uint256 _now = block.timestamp; 
        require((_now - lastClaim[_claim]) >= PERIOD, "FeatureClaim: wait one day to claim");
        //update claim 
        lastClaim[_claim] = _now;
    }

    function claim (address shardNFT, uint256 _shard, uint256 fi) 
        public 
    {
        /*
        *   Check allow claim 
        *   collect payment  
        */
        _mayClaim(shardNFT, _shard, fi);
        
        //get feature 
        (uint256 fid, bytes32 fHash) = FEATURES.featureByIndex(shardNFT, _shard, fi);
        require(fHash != bytes32(0), "FeatureClaim: beyond available features");
        require(fid == FID, "FeatureClaim: incorrect feature type for cliam");
        
        //get basic data 
        (uint256 base, uint256 seed) = ALLY.lifeform(fHash);
        (, uint256 napp) = ALLY.SizeAndNApp(base, seed);
        uint256 cost = COSTM[napp] * COST;
        
        //pull payment, subtract - will throw a error if not enough 
        STATS.sub(PAYID, shardNFT, _shard, cost);
        
        /*
        *   Mint Token 
        */
        //gets id - which will be incremented by mint  
        uint256 _ally = NFTALLY.totalSupply();
        NFTALLY.mint(msg.sender);
        bytes32 allyId = _nftHash(address(NFTALLY), _ally);
        
        /*
        *   Set Stats 
        */
        //home, current shard location 
        bytes memory shardBytes = abi.encode(shardNFT,_shard);
        STATSBYTES.setStat("home", address(NFTALLY), _ally, shardBytes);
        STATSBYTES.setStat("shard", address(NFTALLY), _ally, shardBytes);
        //lifeform, culture 
        STATSBYTES.setStat("people", address(NFTALLY), _ally, abi.encode(fHash,ALLY.baseCulture(fHash)));
        //base stats 
        STATSBYTES.setStat("baseStats", address(NFTALLY), _ally, abi.encode(ALLY.baseStatsFromAlly(fHash, allyId)));
   }    
}