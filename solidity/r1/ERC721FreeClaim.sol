// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10

*/

pragma solidity ^0.8.0;

interface IERC721 {
    function totalSupply() external returns (uint256);
    function mint(address to) external;
}
interface IStats {
    function setStat (string calldata statId, address _721, uint256 nftId, uint256 val) external;
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
}

/*
    Commit / reveal for 721  
*/

contract ERC721FreeClaim {
    //for creating a hash 
    string internal STATID = "HASH";
    uint256 internal NONCE = 0;
    
    //stats contract
    IStats public STATS = IStats(0xeEd019D0726e415526804fb3105a98323911E494);
    IERC721 public NFT = IERC721(0x693eD718D4b4420817e0A2e6e606b888DCbDb39B);

    function claim () 
        public returns (bytes32 hash)
    {
        //gets id - which will be incremented by mint  
        uint256 id = NFT.totalSupply();
        NFT.mint(msg.sender);
        
        //increase NONCE and get random hash 
        NONCE++;
        hash = keccak256(abi.encode(blockhash(block.number-1), block.timestamp, msg.sender, NONCE, address(NFT)));
        //set random hash stat 
        STATS.setStat(STATID, address(NFT), id, uint256(hash));
    }
}