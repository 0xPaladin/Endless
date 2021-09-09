// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId);
}
interface IStats {
    function getStat (string calldata statId, address _721, uint256 nftId) external view returns(uint256);
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
    function getStatsOfIdBatch (address stats, string calldata statId, address nft, uint256[] memory ids) 
        public view returns (uint256[] memory vals)
    {
        vals = new uint256[](ids.length);
        
        for(uint256 i = 0; i < ids.length; i++) {
            vals[i] = IStats(stats).getStat(statId, nft, ids[i]);
        }
    }
    
    //gets a batch of stats from an id  
    function getBatchOfStats (address stats, string[] calldata statIds, address nft, uint256 id) 
        public view returns (uint256[] memory vals)
    {
        vals = new uint256[](statIds.length);
        
        for(uint256 i = 0; i < statIds.length; i++) {
            vals[i] = IStats(stats).getStat(statIds[i], nft, id);
        }
    }
}