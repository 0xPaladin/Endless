// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId);
    function stat(string calldata statId, uint256 id) external view returns (bytes memory);
}

//useful for reducing API calls 
contract ERC721Utilities {

    //gets all the ids of an owner 
    function getNFTIdBatch (address nft, address owner) 
        public view returns (uint256[] memory ids)
    {
        uint256 bal = IERC721(nft).balanceOf(owner);
        ids = new uint256[](bal);
        
        for(uint256 i = 0; i < bal; i++) {
            ids[i] = IERC721(nft).tokenOfOwnerByIndex(owner, i);
        }
    }
    
    //gets stats of a batch of ids 
    function getStatsOfIdBatch (string calldata statId, address nft, uint256[] memory ids) 
        public view returns (bytes[] memory vals)
    {
        vals = new bytes[](ids.length);
        
        for(uint256 i = 0; i < ids.length; i++) {
            vals[i] = IERC721(nft).stat(statId, ids[i]);
        }
    }
    
    //gets a batch of stats from an id  
    function getBatchOfStats (string[] calldata statIds, address nft, uint256 id) 
        public view returns (bytes[] memory vals)
    {
        vals = new bytes[](statIds.length);
        
        for(uint256 i = 0; i < statIds.length; i++) {
            vals[i] = IERC721(nft).stat(statIds[i], id);
        }
    }
}