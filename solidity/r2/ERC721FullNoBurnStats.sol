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
     * @dev Removes Burn capability
     */
    function burn(uint256 tokenId) 
        public override 
    {}
    
    
    /*
    *   Add Stats 
    */
    //allows a contract to set a particular stat :  statId => address => bool 
    mapping (string => mapping(address => bool)) internal _maySet;
    
    //stats for all nfts : statId => id => stat as bytes  
    mapping (string => mapping(uint256 => bytes)) public stat;
    
    //Events
    event StatUpdate (string indexed stat, uint256 indexed id, bytes oldVal, bytes newVal);
    
    /*
        Internal Set 
    */
    function _set (string calldata statId, uint256 id, bytes memory val) 
        internal
    {
        //check that id exists
        require(ownerOf(id) != address(0), "ERC721Stats: cannot set unowned nft");
        emit StatUpdate(statId, id, stat[statId][id], val);
        //set 
        stat[statId][id] = val;
    }
    
    /*
        External Admin 
    */
    function setMaySet (string[] calldata statId, address[] calldata setter, bool[] calldata isAllowed) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ERC721Stats: must have admin role");
        for(uint256 i = 0; i < statId.length; i++){
            _maySet[statId[i]][setter[i]] = isAllowed[i];
        }
    }
    
    /*
        External Use by caller contracts  
    */
    //set stat to new value 
    function set (string calldata statId, uint256 id, bytes memory val) 
        public
    {
        require(_maySet[statId][msg.sender], "ERC721Stats: caller cannot set stat");
        _set(statId, id, val);
    }
    function add (string calldata statId, uint256 id, uint256 val) 
        public
    {
        require(_maySet[statId][msg.sender], "ERC721Stats: caller cannot set stat");
        //add
        uint256 old = stat[statId][id].length == 0 ? 0 : abi.decode(stat[statId][id], (uint256));
        uint256 nVal = old+val;
        _set(statId, id, abi.encode(nVal));
    }
    function sub (string calldata statId, uint256 id, uint256 val) 
        public
    {
        require(_maySet[statId][msg.sender], "ERC721Stats: caller cannot set stat");
        //subtract, check for out of bounds 
        uint256 old = stat[statId][id].length == 0 ? 0 : abi.decode(stat[statId][id], (uint256));
        require(old-val >= 0, "ERC721Stats: subtraction out of bounds");
        uint256 nVal = old-val;
        _set(statId, id, abi.encode(nVal));
    }
}