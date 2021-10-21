// SPDX-License-Identifier: MIT

/*
MIT License
Copyright (c) 2021 Paladin10

*/

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/security/Pausable.sol";

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

contract ERC721CommitReveal is AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint256 public constant COMMIT_PERIOD = 7;
    
    string public constant STATID = "HASH";
    
    uint256 internal NONCE = 0;
    
    //stats contract
    IStats public sc = IStats(0xeEd019D0726e415526804fb3105a98323911E494);

    //maps address of token to cost 
    mapping (address => bool) public isNFT;
    //commit : player => nft => block to reveal 
    mapping (address => mapping(address => uint256)) public activeCommits;
    
    event Reveals (address indexed who, address indexed nft);

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }
    
    /**
     * @dev Sets a address/721 with a cost 
     */
    function setNFT (address _721, bool isAllowed)
        public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ERC721CommitReveal: must have admin role to set nft");
        isNFT[_721] = isAllowed;
    }
    
    /**
     * @dev Buys a 721 
     */
    function commit (address _721) 
        public
    {
        require(!paused(), "ERC721CommitReveal: this contract is paused");
        require(isNFT[_721], "ERC721CommitReveal: this is not an NFT");
        
        //commit 
        activeCommits[msg.sender][_721] = block.number + COMMIT_PERIOD;
    }
    
    function reveal (address _721) 
        public returns (bytes32 hash)
    {
        require(!paused(), "ERC721CommitReveal: this contract is paused");
        
        uint256 _block = activeCommits[msg.sender][_721];
        require(_block != 0, "ERC721CommitReveal: no commit");
        require(block.number >= _block, "ERC721CommitReveal: wait for reveal block");
        require(block.number - _block < 255, "ERC721CommitReveal: waited too long please commit again");
        
        //set to 0 
        activeCommits[msg.sender][_721] = 0;
        
        //gets id - which will be incremented by mint  
        uint256 id = IERC721(_721).totalSupply();
        IERC721(_721).mint(msg.sender);
        
        //increase NONCE and get random hash 
        NONCE++;
        hash = keccak256(abi.encode(blockhash(_block), block.timestamp, NONCE, _721));
        //set random hash stat 
        sc.setStat(STATID, _721, id, uint256(hash));

        //emit 
        emit Reveals(msg.sender, _721);
    }
}