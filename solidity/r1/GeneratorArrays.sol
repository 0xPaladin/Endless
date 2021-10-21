// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10
*/

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";


contract GeneratorArrays is AccessControl {

    mapping (string => uint256[][2]) internal weightedArray;
    mapping (string => uint256[]) internal _array;
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }
    
    function setWeighted (string calldata id, uint256[] calldata vals, uint256[] calldata p) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GeneratorArrays: must have admin role to set weights");
        weightedArray[id] = [vals,p];
    }
    
    function setArray (string calldata id, uint256[] calldata vals) 
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GeneratorArrays: must have admin role to set pick");
        _array[id] = vals;
    }
    
    function getWeighted (string calldata id) 
        public view returns (uint256[] memory vals, uint256[] memory p)
    {
        return (weightedArray[id][0], weightedArray[id][1]);
    }
    
    function getArray (string calldata id) 
        public view returns (uint256[] memory vals)
    {
        return _array[id];
    }
}

