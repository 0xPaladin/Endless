// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IFeature {
    function featureByIndex (uint256 id, uint256 fi) external view returns (uint256 what, bytes32 fHash);
}
interface IERC721 {
    function totalSupply() external returns (uint256);
    function mint(address to) external;
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
    function stat(string calldata statId, uint256 id) external view returns (bytes memory);
    function set (string calldata statId, uint256 id, bytes memory val) external;
    function add (string calldata statId, uint256 id, uint256 val) external;
    function sub (string calldata statId, uint256 id, uint256 val) external;
}

contract ShardAlly {
    /*
    *   internal view/pure functions  
    */
    
    function _shuffle (bytes32 hash, uint256[6] memory arr)
        internal pure returns (uint256[6] memory res)
    {
        //clone arr
        for(uint256 i = 0; i < 6; i++){
            res[i] = arr[i];
        }
        
        //swap 
        bytes32 _hash;
        uint256 j;
        uint256 val;
        for(uint256 i = 0; i < 6; i++){
            _hash = keccak256(abi.encode(hash, i));
            j = uint256(_hash) % (i+1); 
            val = res[i];
            res[i] = res[j];
            res[j] = val;
        }
    }
    
    //hash makes each shard unique 
    function nftHash (address _nft, uint256 id)
        public pure returns (bytes32) 
    {
        return keccak256(abi.encode("But God...",_nft,id));
    }
    
    /*
    *   Basic Ally Generation
    */
    
    uint256 internal constant SEEDMAX = 256 ** 4;
    
    string[5] internal BASEFORM = ["Human","Humanoid","Animal","Artificial","Alien"];
    uint256[12] internal SIZES = [0,1,1,2,2,2,2,2,2,3,3,4];
    uint256[12][5] internal NAPP = [
        [0,1,1,1,1,1,1,2,2,2,2,2],
        [0,0,1,1,1,1,1,1,1,2,2,2],
        [0,0,0,0,1,1,1,1,1,1,2,2],
        [0,0,0,0,0,0,0,0,0,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1]
    ];
    
    // Size and Number Appearing
    function SizeAndNApp (uint256 base, uint256 seed) 
        public view returns (uint256 size, uint256 napp)
    {
        bytes32 hash = lifeformHash(base, seed);
        
        size = 2;
        if(base != 0) {
            bytes32 sizeHash = keccak256(abi.encode(hash,"size"));
            size = SIZES[uint256(sizeHash) % 12];
        }

        bytes32 naHash = keccak256(abi.encode(hash,"nApp"));
        napp = NAPP[size][uint256(naHash) % 12];
    }
    
    /*
    *   Stats 
    */
    
    function statMods (bytes32 hash)
        public pure returns (uint256 b, uint256 p)
    {
        //boost 
        b = uint256(keccak256(abi.encode(hash,"stat-boost"))) % 6; 
        //penalty 
        uint256 _p = 1 + (uint256(keccak256(abi.encode(hash,"stat-penalty"))) % 5);
        p = b+_p > 5 ? b+_p-6 : b+_p;
    }
    
    function baseStats (bytes32 allyId, bytes32 form, bytes32 culture)
        public pure returns (uint256[6] memory stats)
    {
        //basic stat array shuffle 
        stats = _shuffle(keccak256(abi.encode(allyId, "stats")),[uint256(20),25,30,35,40,50]);
        //mod for culture and people 
        (uint256 fb, uint256 fp) = statMods(form);
        (uint256 cb, uint256 cp) = statMods(culture);
        stats[fb] += 10;
        stats[cb] += 10;
        stats[fp] -= 10;
        stats[cp] -= 10;
    }
    
    function baseStatsFromAlly (bytes32 featureHash, bytes32 allyId)
    public view returns (uint256[6] memory stats)
    {
        (uint256 base, uint256 seed) = lifeform(featureHash);
        return baseStats(allyId, lifeformHash(base, seed), baseCulture(featureHash));
    }
    
    //Culture and Lifeform 
    
    function baseCulture (bytes32 hash)
        public pure returns (bytes32)
    {
        return keccak256(abi.encode(hash, "culture"));
    }
    
    function lifeformHash (uint256 base, uint256 seed)
        public view returns (bytes32)
    {
        return keccak256(abi.encode(BASEFORM[base],seed));
    }
    
    // hash = feature hash 
    function lifeform (bytes32 hash)
        public pure returns (uint256 base, uint256 seed) 
    {
        //first is the base form of the creature
        uint256 bp = uint256(hash) % 100;
        base = bp < 10 ? 0 : bp < 35 ? 1 : bp < 60 ? 2 : bp < 80 ? 3 : 4; 
        
        //next is the seed id 
        uint256 rp = uint256(keccak256(abi.encode(hash, "seed-distribution"))) % 100;
        //seed range is a distribution - 50% < 100; 90% < 1000
        uint256 _rangeMax = rp < 50 ? 100 : rp < 90 ? 1000 : SEEDMAX;   
        //get seed based upon range
        seed = uint256(keccak256(abi.encode(hash, "seed"))) % _rangeMax;
    }
    
    /*
    *   Claim an Ally 
    */
    
    //contracts 
    IERC721 public SHARDS = IERC721(0x8dB24cD8451B133115588ff1350ca47aefE2CB8c);
    IFeature public FEATURES = IFeature(0x47eC56991f0E456593b7F26897C44b72617C77C4);
    IERC721 public ALLY = IERC721(0xAe1Ad876f3759eaBcc04733ce32918cBEC5218B5);
    
    //feature id 
    uint256 internal constant FID = 0;
    
    //pay to claim 
    string internal PAYID = "SRD.COSMIC";
    uint256 internal COST = 1 ether;
    //cost multiplyer based upon # appearing 
    uint256[3] internal COSTM = [10,5,3];
    
    //claim once per day 
    uint256 internal PERIOD = 1 days;
    mapping (bytes32 => uint256) public lastClaim;
    
    //unique id for each claim for traking time 
    function _claimId (uint256 id, uint256 fi) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(id, fi));
    }
    
    //check for approval 
    function _isApprovedOrOwner(uint256 id) internal view returns (bool) {
        return SHARDS.getApproved(id) == msg.sender || SHARDS.ownerOf(id) == msg.sender;
    }
    
    /*
     * *   Check allow claim 
    */
    
    function _mayClaim (uint256 id, uint256 fi) 
        internal returns (bytes32)
    {
        require(_isApprovedOrOwner(id), "ShardAlly: not approved or owner");
        
        //claim period 
        bytes32 _claim = _claimId(id,fi);
        uint256 _now = block.timestamp; 
        require((_now - lastClaim[_claim]) >= PERIOD, "ShardAlly: wait one day to claim");
        //update claim 
        lastClaim[_claim] = _now;
        
        //get feature 
        (uint256 fid, bytes32 fHash) = FEATURES.featureByIndex(id, fi);
        require(fHash != bytes32(0), "ShardAlly: beyond available features");
        require(fid == FID, "ShardAlly: incorrect feature type for cliam");
        
        return fHash;
    }


    //claim 
    function claim (uint256 _shard, uint256 fi) 
        public 
    {
        //check claim allowance - get hash of feature 
        bytes32 fHash = _mayClaim(_shard, fi);
        
        //get basic data - lifeform and # appearing 
        (uint256 base, uint256 seed) = lifeform(fHash);
        (, uint256 napp) = SizeAndNApp(base, seed);
        //cost based upon # 
        uint256 cost = COSTM[napp] * COST;
        
        //pull payment, subtract - will throw a error if not enough 
        SHARDS.sub(PAYID, _shard, cost);
        
        /*
        *   Mint Token 
        */
        //gets id - which will be incremented by mint  
        uint256 _ally = ALLY.totalSupply();
        ALLY.mint(msg.sender);
        bytes32 allyId = nftHash(address(ALLY), _ally);
        
        /*
        *   Set Stats 
        */
        //home, current shard location 
        bytes memory shardBytes = abi.encode(address(SHARDS),_shard);
        ALLY.set("home", _ally, shardBytes);
        ALLY.set("shard", _ally, shardBytes);
        //lifeform, culture 
        ALLY.set("people", _ally, abi.encode(fHash, baseCulture(fHash)));
        //base stats 
        ALLY.set("baseStats", _ally, abi.encode(baseStatsFromAlly(fHash, allyId)));
   }    
}