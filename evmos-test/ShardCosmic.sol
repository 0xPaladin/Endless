// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
    function stat(string calldata statId, uint256 id) external view returns (bytes memory);
    function add (string calldata statId, uint256 id, uint256 val) external;
    function sub (string calldata statId, uint256 id, uint256 val) external;
}

contract ShardCosmic{
    address public admin;
    
    uint256 internal NONCE = 0;
    
    //contracts 
    IERC721 public SHARDS = IERC721(0x8dB24cD8451B133115588ff1350ca47aefE2CB8c);

    //Constants for claiming 
    uint256 internal PERIOD = 1 days;
    uint256 internal constant BASEVAL = 1 ether;
    uint256 internal constant MAX = 5;
    string internal constant COSMIC = "COSMIC";
    //percent 50 / 1000 = 5%
    uint256 internal SIZEMULTI = 50;
    
    //constant to determine size based upon held cosmic 
    uint256[6] internal SIZEBYCOSMIC = [10,20,50,200,1000,5000];

    //tracks the last claim of a shard : id => claim time 
    mapping (uint256 => uint256) public lastClaim;
    
    //Events
    event Claim (uint256 indexed id, uint256 val);
    
    constructor() {
        admin = msg.sender;
    }
    
    /*
        Internal 
    */
    
    function _dice (bytes32 _hash, uint256 n, uint256 d)
        internal pure returns (uint256[] memory r, uint256 sum)
    {
        r = new uint256[](n);
        for(uint256 i = 0; i < n; i++){
            bytes32 rHash = keccak256(abi.encode(_hash, i));
            r[i] = 1 + (uint256(rHash) % d);
            sum += r[i];
        }
    }

    /*
        Admin 
    */
    
    function setPeriod (uint256 newPeriod) 
        public
    {
        require(admin == msg.sender, "ShardCosmicClaim: must have admin role to set PERIOD");
        PERIOD = newPeriod;
    }
    
    /*
        Logic
    */
    //hash makes each shard unique 
    function hash (uint256 id)
        public view returns (bytes32) 
    {
        return keccak256(abi.encode("But God...",address(SHARDS),id));
    }
    
    //size increase based upon cosmic 
    function cosmicSize(uint256 id) 
        public view returns (uint256 sz, uint256 m)
    {
        //pull cosmic stat - everything in bytes
        uint256 _cosmic = _pullCosmic(id) / 1e18;
        //ge size comparison array 
        uint256 l = SIZEBYCOSMIC.length;
        //loop to get size 
        if(_cosmic >= SIZEBYCOSMIC[l-1]) 
        {
            sz = l;
        }
        else {
            for(uint256 i = 0; i < l; i++)
            {
                if(_cosmic < SIZEBYCOSMIC[i])
                {
                    sz = i;
                    break;
                }
            }
        }

        uint256 max = sz==l ? SIZEBYCOSMIC[l-1]*2 : SIZEBYCOSMIC[sz];
        uint256 min = sz==0 ? 0 : SIZEBYCOSMIC[sz-1];
        m =  100 * (_cosmic-min) / (max-min);
    }
    
    function size(uint256 id) 
        public view returns (uint256 sz, uint256 nR, uint256 nF)
    {
        (uint256 _sz, uint256 m) = cosmicSize(id);
        sz = _sz;
        
        if(sz == 0) {
            nR = 1;
            nF = 3;
        }
        else {
            //based on generation 
            bytes32 _hash = hash(id);
        
            //number of regions - always use a d8
            ( , nR) = _dice(keccak256(abi.encode(_hash, "nRegions")), sz,8);
            nR *= (100+m)/100;
            //number of features - always use a d6
            ( , nF) = _dice(keccak256(abi.encode(_hash, "nFeatures")), sz,6);
            nF += 2;
            nF *= (100+m)/100;
        }
    }
    
    /*
        Claim  
    */

    //anyone may claim for an id 
    function claim(uint256 id) 
        public returns (uint256)
    {
        uint256 _now = block.timestamp;
        uint256 delta = _now - lastClaim[id];
        
        //multiply by size 
        (, uint256 nR, ) = size(id);
        uint256 base = BASEVAL + nR * (BASEVAL * SIZEMULTI / 1000);
        uint256 max = MAX * base;
        
        //value to claim  
        uint256 val = base * delta / PERIOD;
        
        //multiply by size 
        val = lastClaim[id] == 0 ? base : val > max ? max : val;

        //set the last claim 
        lastClaim[id] = _now;
        
        //set the stat - will throw error if shard does not exist 
        SHARDS.add(COSMIC, id, val);
        emit Claim(id, val);
        
        return val;
    }
    
    /*
        Transfer
    */
    uint256 internal MIN = 77;

    //Events
    event Transfer (uint256 indexed from, uint256 indexed to, uint256 val);
    
    function _isApprovedOrOwner(uint256 id) internal view returns (bool) {
        return SHARDS.getApproved(id) == msg.sender || SHARDS.ownerOf(id) == msg.sender;
    }

    //main transfer function 
    function transfer(uint256 fromId, uint256 toId, uint256 val) 
        public
    {
        require(_isApprovedOrOwner(fromId), "ShardCosmic: not approved to transfer");
        
        //subtract - will throw a error if not enough 
        SHARDS.sub(COSMIC, fromId, val);
        
        //determine percent - due to friction 
        (, uint256 fp) = _dice(keccak256(abi.encode(NONCE, block.timestamp, msg.sender)), 3, 6);
        fp += MIN; 
        uint256 _val = val * fp / 100;
        
        //add to other  
        SHARDS.add(COSMIC, toId, _val);
        emit Transfer(fromId, toId, val);
        
        NONCE++;
    }
    
    /*
        Views
    */
    function _pullCosmic (uint256 id) 
        internal view returns (uint256)
    {
        bytes memory _cb = SHARDS.stat(COSMIC,id);
        return _cb.length == 0 ? 0 : abi.decode(_cb, (uint256));
    }
    
    function cosmic(uint256[] calldata ids) 
        public view returns (uint256[] memory vals)
    {
        uint256 l = ids.length;
        vals = new uint256[](l);
        for(uint256 i = 0; i < l; i++){
            vals[i] = _pullCosmic(ids[i]);
        }
    }
}