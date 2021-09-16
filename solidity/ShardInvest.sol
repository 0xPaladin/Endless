// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IStats {
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function sub (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
}
interface IERC721 {
    function totalSupply() external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
}

contract ShardInvest {
    //stats contract
    IStats public sc = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    
    string public constant STATID = "SRD.COSMIC";
    uint256 public COSMIC_CONVERT = (1 ether)/1000;
    
    uint256 public REDUCTION_PERIOD = 5 * (1 days);
    uint256 public REDUCTION_AMT = 1000;
    
    //invested cosmic 
    mapping (bytes32 => uint256) internal _invested;
    //last investment 
    mapping (bytes32 => uint256) internal _lastInvest;
    
    //nft id based upon contract and id 
    function _nftId (address _721, uint256 _id) 
        internal pure returns(bytes32) 
    {
        return keccak256(abi.encode(_721, _id));
    }
    
    function _isApprovedOrOwner(address _721, uint256 id) 
        internal view returns (bool) 
    {
        return IERC721(_721).getApproved(id) == msg.sender || IERC721(_721).ownerOf(id) == msg.sender;
    }
    
    function invest (address _721, uint256 id, uint256 amt)
        public
    {
        require(_isApprovedOrOwner(_721,id), "ShardInvest: not owner/approved");
        
        //reduce cosmic 
        sc.sub(STATID, _721, id, amt);
        
        //add to invested 
        _invested[_nftId(_721,id)] += amt / COSMIC_CONVERT;
    }
        
}
