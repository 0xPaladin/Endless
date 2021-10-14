// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract ERC721FullNoBurn is ERC721PresetMinterPauserAutoId {
    
    string private _baseTokenURI;
    
    uint256 public MAX = 5;
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721PresetMinterPauserAutoId(name, symbol, "") {}
    
    
    /**
     * @dev Sets Base URI
     */
    function setBaseURI (string memory URI) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ERC721FullNoBurn: must have admin role to change URI");
        _baseTokenURI = URI;
    }
    
    /**
     * @dev Sets Max #of Tokens 
     */
    function setMax (uint256 _max) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ERC721FullNoBurn: must have admin role to change URI");
        MAX = _max;
    }
    
    /**
     * @dev Limits token supply 
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721PresetMinterPauserAutoId) {
        super._beforeTokenTransfer(from, to, tokenId);
        
        require(totalSupply() <= MAX, "ERC721FullNoBurn: Limited Token Supply");
    }
    
    /**
     * @dev Removes Burn capability
     */
    function burn(uint256 tokenId) 
        public override 
    {}
}