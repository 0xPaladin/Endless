// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

contract AllyBasic {
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
    
    function _size (bytes32 hash) 
        internal view returns (uint256)
    {
        bytes32 sizeHash = keccak256(abi.encode(hash,"size"));
        return SIZES[uint256(sizeHash) % 12];
    }
    
    function _nApp (uint256 size, bytes32 hash) 
        internal view returns (uint256)
    {
        uint256 np = uint256(keccak256(abi.encode(hash,"nApp"))) % 12;
        return NAPP[size][np];
    }
    
    function SizeAndNApp (uint256 base, uint256 seed) 
        public view returns (uint256 size, uint256 napp)
    {
        bytes32 hash = lifeformHash(base, seed);
        size = base == 0 ? 2 : _size(hash);
        napp = _nApp(size, hash);
    }
    
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
    
    // hash = feature hash 
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
}