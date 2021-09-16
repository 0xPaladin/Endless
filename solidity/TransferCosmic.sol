// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface ISeededRandom {
    function dice (bytes32 hash, uint256 n, uint256 d) external pure returns (uint256[] memory r, uint256 sum);
}
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
}
interface IStats {
    function add (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function sub (string calldata statId, address _721, uint256 nftId, uint256 val) external;
}

contract TransferCosmic {

    uint256 internal MIN = 77;
    string public constant STATID = "SRD.COSMIC";

    ISeededRandom public RND = ISeededRandom(0xe876c509705Da5E21738b8c5F4399861ad2432D0);
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);

    //Events
    event Transfer (bytes32 indexed from, bytes32 indexed to, uint256 val);
    
    function _hash (address nft, uint256 id)
        internal pure returns (bytes32) 
    {
        return keccak256(abi.encode(nft,id));
    }
    
    function _isApprovedOrOwner(address nft, uint256 id) internal view returns (bool) {
        return IERC721(nft).getApproved(id) == msg.sender || IERC721(nft).ownerOf(id) == msg.sender;
    }

    //main transfer function 
    function transfer(address fromNFT, uint256 fromId, address toNFT, uint256 toId, uint256 val) 
        public
    {
        require(_isApprovedOrOwner(fromNFT, fromId), "TransferCosmic: not approved to transfer");
        
        //subtract - will throw a error if not enough 
        STATS.sub(STATID, fromNFT, fromId, val);
        
        //determine percent - due to friction 
        (, uint256 fp) = RND.dice(keccak256(abi.encode(blockhash(block.number-1), block.timestamp, msg.sender)), 3, 6);
        fp += MIN; 
        uint256 _val = val * fp / 100;
        
        //add to other  
        STATS.add(STATID, toNFT, toId, _val);
        emit Transfer(_hash(fromNFT,fromId), _hash(toNFT,toId), val);
    }
}