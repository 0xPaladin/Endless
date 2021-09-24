// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";

contract StatsBytes is AccessControl{

    //allows a contract to set a particular stat :  _statId => address => bool 
    mapping (string => mapping(address => bool)) public maySet;
    //stats for all nfts : _statId => _nftId => stat 
    mapping (string => mapping(bytes32 => bytes)) internal _stat;

    //Events
    event StatUpdate (string indexed stat, address indexed _721, uint256 indexed nftId, bytes val);

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }
    
    /*
        Internal
    */
    function _nftId (address _721, uint256 _id) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(_721, _id));
    }
    
    /*
        External Admin 
    */
    function setMaySet (string calldata statId, address setter, bool isAllowed) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "StatsBytes: must have admin role to set allowance");
        maySet[statId][setter] = isAllowed;
    }
    
    /*
        External
    */
    //view stat val 
    function getStat (string calldata statId, address _721, uint256 nftId)
        public view returns(bytes memory)
    {
        return _stat[statId][_nftId(_721, nftId)];
    }
    
    //set stat to new value 
    function setStat (string calldata statId, address _721, uint256 nftId, bytes memory val) 
        public
    {
        require(maySet[statId][msg.sender], "StatsBytes: caller cannot set stat");
        
        bytes32 _nft = _nftId(_721, nftId);
        //set 
        _stat[statId][_nft] = val;
        emit StatUpdate(statId, _721, nftId, val);
    }
}