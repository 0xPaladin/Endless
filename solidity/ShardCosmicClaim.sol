// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";

interface IStats {
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
}

interface IERC721 {
    function totalSupply() external view returns (uint256);
}

contract ShardCosmicClaim is AccessControl{

    uint256 public PERIOD = 1 days;
    uint256 public constant BASEVAL = 1 ether;
    uint256 public constant MAXCLAIM = 5 * (1 ether);
    string public constant STATID = "SRD.COSMIC";
    
    //stats contract
    IStats public sc = IStats(0xeEd019D0726e415526804fb3105a98323911E494);

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

    //anyone may claim for an id 
    function claim(address nft, uint256 id) 
        public returns (uint256)
    {
        require(isNFT[nft], "ShardCosmicClaim: claim cosmic with that nft");
        //check for total minted 
        require(IERC721(nft).totalSupply() > id, "ShardCosmicClaim: cannot be greater than total shard count");
        
        uint256 _now = block.timestamp;
        uint256 delta = _now - lastClaim[nft][id];
        
        //value to claim - 
        uint256 val = BASEVAL * delta / PERIOD;
        val = lastClaim[nft][id] == 0 ? BASEVAL : val > MAXCLAIM ? MAXCLAIM : val;

        //set the last claim 
        lastClaim[nft][id] = _now;
        
        //set the stat 
        sc.add(STATID, nft, id, val);
        emit Claim(nft, id, val);
        
        return val;
    }
}