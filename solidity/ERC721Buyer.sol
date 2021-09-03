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

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/security/Pausable.sol";

interface IERC721 {
    function totalSupply() external returns (uint256);
    function mint(address to) external;
}

/*
    Buys 721 with native token 
*/

contract ERC721Buyer is AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    address payable public bank;

    //maps address of token to cost 
    mapping (address => uint256) public cost;
    
    event Purchase (address indexed who, address indexed what, uint256 when);
    event Withdrawal (address indexed who, address where, uint256 amt);
    event SetBank (address newBank);

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        
        bank = payable(_msgSender());
    }
    
    /**
     * @dev Sets the bank contract and emits event 
     */
    function setBank (address payable _bank)
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Catalog: must have admin role to set bank");
        
        bank = _bank;
        emit SetBank(_bank);
    }
    
    /**
     * @dev Performs withdraw of balance of the contract to the bank
     */
    function withdraw ()
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Catalog: must have admin role to withdraw");
        
        //get balance 
        uint256 balance = address(this).balance;
        
        //Withdraw
        bank.transfer(balance);
        
        emit Withdrawal(msg.sender, bank, balance);
    }
    
    /**
     * @dev Sets a address/721 with a cost 
     */
    function setCost (address _721, uint256 _cost)
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Catalog: must have admin role to set cost");
        
        cost[_721] = _cost;
    }
    
    /**
     * @dev Buys a 721 
     */
    function buy (address _721) 
        public
        payable
    {
        require(!paused(), "ERC721Buyer: this contract is paused");
        
        uint256 _cost = cost[_721];
        require(_cost != 0, "ERC721Buyer: the 721 is not enabled");
        require(msg.value >= _cost, "ERC721Buyer: did not provide enough funds");
        
        //mint 
        IERC721(_721).mint(msg.sender);

        //emit 
        emit Purchase(msg.sender, _721, block.timestamp);
    }
}