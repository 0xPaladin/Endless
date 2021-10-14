// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}
interface IShardSize {
    function size(address nft, uint256 id) external view returns (uint256 sz, uint256 nR, uint256 nF);
}
interface IStats {
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) external;
}

contract ShardCosmicClaim is AccessControl{

    uint256 public PERIOD = 1 days;
    uint256 public constant BASEVAL = 1 ether;
    uint256 public SIZEMULTI = 50;
    uint256 public constant MAX = 5;
    string public constant STATID = "SRD.COSMIC";
    
    IShardSize public SIZE = IShardSize(0xAA6411a301A6e423f5eb9b1bF455CeBD0B2d2098);
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);

    //allowable nfts 
    mapping (address => bool) public isNFT;
    //tracks the last claim of a shard : nft => id => claim time 
    mapping (address => mapping(uint256 => uint256)) public lastClaim;
    
    //Events
    event Claim (address indexed nft, uint256 indexed id, uint256 val);
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }
    
    /**
     * @dev Sets a address/721 
     */
    function setIsNFT (address nft, bool isAllowed)
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ShardCosmicClaim: must have admin role to set nft");
        isNFT[nft] = isAllowed;
    }

    function setPeriod (uint256 newPeriod) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ShardCosmicClaim: must have admin role to set PERIOD");
        PERIOD = newPeriod;
    }
    
    function setSizeMulti (uint256 newM) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ShardCosmicClaim: must have admin role to set PERIOD");
        SIZEMULTI = newM;
    }

    //anyone may claim for an id 
    function claim(address nft, uint256 id) 
        public returns (uint256)
    {
        require(isNFT[nft], "ShardCosmicClaim: claim cosmic with that nft");
        require(IERC721(nft).ownerOf(id) != address(0), "ShardCosmicClaim: nft does not exist");

        uint256 _now = block.timestamp;
        uint256 delta = _now - lastClaim[nft][id];
        
        //multiply by size 
        (, uint256 nR, ) = SIZE.size(nft, id);
        uint256 base = BASEVAL + nR * (BASEVAL * SIZEMULTI / 1000);
        uint256 max = MAX * base;
        
        //value to claim  
        uint256 val = base * delta / PERIOD;
        
        //multiply by size 
        val = lastClaim[nft][id] == 0 ? base : val > max ? max : val;

        //set the last claim 
        lastClaim[nft][id] = _now;
        
        //set the stat 
        STATS.add(STATID, nft, id, val);
        emit Claim(nft, id, val);
        
        return val;
    }
}