// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface ISeededRandom {
    function integer (bytes32 hash, uint256 max) external pure returns (uint256);
    function dice (bytes32 hash, uint256 n, uint256 d) external pure returns (uint256[] memory r, uint256 sum);
    function pickone (bytes32 hash, uint256[] memory arr) external pure returns (uint256 val);
    function shuffle (bytes32 hash, uint256[] memory arr) external pure returns (uint256[] memory res);
    function weighted (bytes32 hash, uint256[] memory arr, uint256[] memory p) external pure returns (uint256 res);
}
interface IStats {
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
}

contract ShardGen {
    //stats contract
    IStats public STAT = IStats(0xf8e81D47203A594245E36C48e151709F0C19fBe8);
    ISeededRandom public RND = ISeededRandom(0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8);

    uint256[6] internal SIZEBYCOSMIC = [10,20,50,200,1000,5000];
    
    uint256[12] internal ALIGNMENT = [0,1,1,2,2,2,2,2,2,3,3,4];
    uint256[5] internal ALIGNMENT_MOD = [8,10,5,0,2];
    uint256[22] internal SAFETY = [3,3,3,3,3,3,2,2,1,1,1,1,1,1,1,0,0,0,0,0,0,0];
    
    uint256[12] internal CLIMATE = [0,1,1,1,1,2,2,1,1,1,1,0];
    uint256 internal ISWATER = 4;
    uint256[12][3] internal TERRAINS = 
    [
        [6,6,6,5,5,4,4,3,3,3,4,4],
        [6,6,6,6,6,5,4,4,4,2,3,3],
        [6,6,6,5,5,4,4,4,2,3,3,3]
    ];
    
    function hash (address nft, uint256 id)
        public view returns (bytes32) 
    {
        uint256 _stat = STAT.getStat("HASH", nft, id);
        return _stat != 0 ? bytes32(_stat) : keccak256(abi.encode("But God...",nft,id));
    }
    
    function culture (address nft, uint256 id) 
        public view returns (bytes32)
    {
        //based on generation 
        bytes32 _hash = hash(nft,id);
        bool hasCulture = RND.integer(keccak256(abi.encode(_hash,"hasCulture")), 2) == 1;
        return hasCulture ? keccak256(abi.encode(_hash,"culture")) : bytes32(0);
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
    
    function climateTerrain (address nft, uint256 id) 
        public view returns (uint256 climate, uint256 terrain)
    {
        //based on generation 
        bytes32 _hash = hash(nft,id);
        climate = CLIMATE[RND.integer(keccak256(abi.encode(_hash,"climate")), 12)];
        
        //check if water 
        bool isWater = RND.integer(keccak256(abi.encode(_hash,"isWater")), 10) < ISWATER;
        bytes32 hashTerrain = keccak256(abi.encode(_hash,"terrain"));
        if(isWater){
            terrain = RND.integer(hashTerrain, 2);
        }
        else {
            terrain = TERRAINS[climate][RND.integer(hashTerrain, 12)];
        }
    } 
    
    //feature based on number  
    function featureByIndex (address nft, uint256 id, uint256 fi) 
        public view returns (uint256 what, bytes32 fHash)
    {
        bytes32 _hash = hash(nft,id);
        bytes32 _baseHash = keccak256(abi.encode(_hash,"feature",fi));
        
        //get safety
        (,uint256 safe) = safety(nft, id);
        
        //first 2 are set - otherwise random number 
        uint256 r = fi < 2 ? [1,65][fi] : 1 + RND.integer(_baseHash, 120) + (10 * safe);
        
        if(r <= 40) {
            //creature
            what = 0;
        }
        else if (r <= 50) {
            //hazard 
            what = 1;
        }
        else if (r <= 60) {
            //obstacle
            what = 2;
        }
        else if (r <= 75) {
            //area 
            what = 3;
        }
        else if (r <= 79) {
            //dungeon 
            what = 4;
        }
        else if (r <= 83) {
            //lair 
            what = 5;
        }
        else if (r <= 87) {
            //ruin 
            what = 6;
        }
        else if (r <= 91) {
            //outpost 
            what = 7;
        }
        else if (r <= 95) {
            //landmark 
            what = 8;
        }
        else if (r <= 100) {
            //resource 
            what = 9;
        }
        else if (r <= 110) {
            //faction
            what = 10;
        }
        else {
            //settlement
            what = 11;
        }
        
        fHash = keccak256(abi.encode(_baseHash, what));
    }
    
    //base size is 1 for all gen 0, otherwise 0
    function baseSize(address nft) 
        public pure returns (uint256 sz)
    {
        return nft == 0x8dB24cD8451B133115588ff1350ca47aefE2CB8c ? 1 : 0; 
    }
    
    //size increase based upon cosmic 
    // "SRD.SizeByCosmic" = ;
    function cosmicSize(address nft, uint256 id) 
        public view returns (uint256 sz, uint256 m)
    {
        uint256 cosmic = baseSize(nft) * 11;
        //pull cosmic stat 
        cosmic += (STAT.getStat("SRD.COSMIC",nft,id) / (1e18));
        //ge size comparison array 
        uint256 l = SIZEBYCOSMIC.length;
        //loop to get size 
        if(cosmic >= SIZEBYCOSMIC[l-1]) 
        {
            sz = l;
        }
        else {
            for(uint256 i = 0; i < l; i++)
            {
                if(cosmic < SIZEBYCOSMIC[i])
                {
                    sz = i;
                    break;
                }
            }
        }

        uint256 max = sz==l ? SIZEBYCOSMIC[l-1]*2 : SIZEBYCOSMIC[sz];
        uint256 min = sz==0 ? 0 : SIZEBYCOSMIC[sz-1];
        m =  100 * (cosmic-min) / (max-min);
    }
    
    function size(address nft, uint256 id) 
        public view returns (uint256 sz, uint256 nR, uint256 nF)// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface ISeededRandom {
    function integer (bytes32 hash, uint256 max) external pure returns (uint256);
    function dice (bytes32 hash, uint256 n, uint256 d) external pure returns (uint256[] memory r, uint256 sum);
    function pickone (bytes32 hash, uint256[] memory arr) external pure returns (uint256 val);
    function shuffle (bytes32 hash, uint256[] memory arr) external pure returns (uint256[] memory res);
    function weighted (bytes32 hash, uint256[] memory arr, uint256[] memory p) external pure returns (uint256 res);
}
interface IStats {
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
}

contract ShardGen {
    //stats contract
    IStats public STAT = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    ISeededRandom public RND = ISeededRandom(0xe876c509705Da5E21738b8c5F4399861ad2432D0);

    uint256[6] internal SIZEBYCOSMIC = [10,20,50,200,1000,5000];
    
    function hash (address nft, uint256 id)
        public view returns (bytes32) 
    {
        uint256 _stat = STAT.getStat("HASH", nft, id);
        return _stat != 0 ? bytes32(_stat) : keccak256(abi.encode("But God...",nft,id));
    }
    
    //base size is 1 for all gen 0, otherwise 0
    function baseSize(address nft) 
        public pure returns (uint256 sz)
    {
        return nft == 0x8dB24cD8451B133115588ff1350ca47aefE2CB8c ? 1 : 0; 
    }
    
    //size increase based upon cosmic 
    function cosmicSize(address nft, uint256 id) 
        public view returns (uint256 sz, uint256 m)
    {
        uint256 cosmic = baseSize(nft) * 11;
        //pull cosmic stat 
        cosmic += (STAT.getStat("SRD.COSMIC",nft,id) / (1e18));
        //ge size comparison array 
        uint256 l = SIZEBYCOSMIC.length;
        //loop to get size 
        if(cosmic >= SIZEBYCOSMIC[l-1]) 
        {
            sz = l;
        }
        else {
            for(uint256 i = 0; i < l; i++)
            {
                if(cosmic < SIZEBYCOSMIC[i])
                {
                    sz = i;
                    break;
                }
            }
        }

        uint256 max = sz==l ? SIZEBYCOSMIC[l-1]*2 : SIZEBYCOSMIC[sz];
        uint256 min = sz==0 ? 0 : SIZEBYCOSMIC[sz-1];
        m =  100 * (cosmic-min) / (max-min);
    }
    
    function size(address nft, uint256 id) 
        public view returns (uint256 sz, uint256 nR, uint256 nF)
    {
        (uint256 _sz, uint256 m) = cosmicSize(nft, id);
        sz = _sz;
        
        if(sz == 0) {
            nR = 1;
            nF = 3;
        }
        else {
            //based on generation 
            bytes32 _hash = hash(nft,id);
        
            //number of regions - always use a d8
            ( , nR) = RND.dice(keccak256(abi.encode(_hash, "nRegions")), sz,8);
            nR *= (100+m)/100;
            //number of features - always use a d6
            ( , nF) = RND.dice(keccak256(abi.encode(_hash, "nFeatures")), sz,6);
            nF += 2;
            nF *= (100+m)/100;
        }
    }
}



    {
        (uint256 _sz, uint256 m) = cosmicSize(nft, id);
        sz = _sz;
        
        if(sz == 0) {
            nR = 1;
            nF = 3;
        }
        else {
            //based on generation 
            bytes32 _hash = hash(nft,id);
        
            //number of regions - always use a d8
            ( , nR) = RND.dice(keccak256(abi.encode(_hash, "nRegions")), sz,8);
            nR *= (100+m)/100;
            //number of features - always use a d6
            ( , nF) = RND.dice(keccak256(abi.encode(_hash, "nFeatures")), sz,6);
            nF += 2;
            nF *= (100+m)/100;
        }
    }
}

contract TestHash {
    
    mapping (string => mapping(bytes32 => uint256)) public stats;
    
    function setStat (string calldata statId, address _721, uint256 nftId, uint256 val) 
        public
    {
        bytes32 _hash = keccak256(abi.encode(_721,nftId));
        stats[statId][_hash] = val;
    }
    
    function getStat (string calldata statId, address _721, uint256 nftId) 
        public view returns(uint256)
    {
        bytes32 _hash = keccak256(abi.encode(_721,nftId));
        return stats[statId][_hash];
    }
}

