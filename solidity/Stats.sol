// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";

contract Stats is AccessControl{

    //allows a contract to set a particular stat :  _statId => address => bool 
    mapping (bytes32 => mapping(address => bool)) internal _maySet;
    //stats for all nfts : _statId => _nftId => stat 
    mapping (bytes32 => mapping(bytes32 => uint256)) internal _stat;
    //track totals: _statId => total 
    mapping (bytes32 => uint256) internal _totals;
    
    //Events
    event StatUpdate (string indexed stat, address indexed _721, uint256 indexed nftId, uint256 oldVal, uint256 newVal);

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }
    
    /*
        Internal
    */
    function _statId (string calldata statId) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(statId));
    }
    
    function _nftId (address _721, uint256 _id) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(_721, _id));
    }
    
    function _maySetStat (string calldata statId, address setter) 
        internal view returns(bool) 
    {
        return _maySet[_statId(statId)][setter];
    }
    
    /*
        External Admin 
    */
    function setMaySet (string calldata statId, address setter, bool isAllowed) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Stats: must have admin role to set allowance");
        _maySet[_statId(statId)][setter] = isAllowed;
    }
    
    /*
        External
    */
    //view totals 
    function totalSupply (string calldata statId)
        public view returns(uint256)
    {
        return _totals[_statId(statId)];
    }
    
    //view stat val 
    function getStat (string calldata statId, address _721, uint256 nftId)
        public view returns(uint256)
    {
        return _stat[_statId(statId)][_nftId(_721, nftId)];
    }
    
    //add stat 
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) 
        public
    {
        require(_maySetStat(statId, msg.sender), "Stats: caller cannot set stat");

        bytes32 _nft = _nftId(_721, nftId);
        bytes32 sid = _statId(statId);
        //add increases total 
        _totals[sid] += val;

        //add value to nft 
        uint256 old = _stat[sid][_nft];
        _stat[sid][_nft] += val;
        emit StatUpdate(statId, _721, nftId, old, _stat[sid][_nft]);
    }
    
    //subtract stat 
    function sub (string calldata statId, address _721, uint256 nftId, uint256 val) 
        public
    {
        require(_maySetStat(statId, msg.sender), "Stats: caller cannot set stat");

        bytes32 _nft = _nftId(_721, nftId);
        //stat id 
        bytes32 sid = _statId(statId);
        //old value
        uint256 old = _stat[sid][_nft];
        require(_totals[sid]-val >= 0,"Stats: cannot reduce totals below 0");
        require(old-val >= 0,"Stats: cannot reduce nft stat below 0");
        
        //sub from total 
        _totals[sid] -= val;

        //sub from nft 
        _stat[sid][_nft] -= val;
        emit StatUpdate(statId, _721, nftId, old, _stat[sid][_nft]);
    }
    
    //set stat to new value 
    function setStat (string calldata statId, address _721, uint256 nftId, uint256 val) 
        public
    {
        require(_maySetStat(statId, msg.sender), "Stats: caller cannot set stat");
        
        bytes32 _nft = _nftId(_721, nftId);
        //stat id 
        bytes32 sid = _statId(statId);
        //old value
        uint256 old = _stat[sid][_nft];
        //set 
        _stat[sid][_nft] = val;
        emit StatUpdate(statId, _721, nftId, old, _stat[sid][_nft]);
    }
}