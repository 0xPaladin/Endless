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

//simplisic mint
contract ERC721FreeClaim {
    function claim (address nft) 
        public 
    {
        IERC721(nft).mint(msg.sender);
    }
}