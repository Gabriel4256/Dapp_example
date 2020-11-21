pragma solidity ^0.5;
pragma experimental ABIEncoderV2;


contract IAuction{
    
    function registerItem(string memory name) public;
    function registerName(string memory name) public;
    function registerAuctionItem(string memory name, uint start_price, uint limit_price, uint date) public;
    function auctionBidding(uint aid) payable public;
    function auctionEnd(uint aid) payable public;
    function balanceTransfer(address payable seller, uint price) payable public;
    function changeItemOwner(uint iid, address addr) public;
    function getMyItems() public view returns(string memory);
    function getName() public view returns(string memory);
    function getAllRegisteredItems() public view returns(string memory);
    function getAllAuctionedItems() public view returns(string memory);
}