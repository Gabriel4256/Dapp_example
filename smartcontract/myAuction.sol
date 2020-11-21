pragma solidity ^0.5;

import "./IAuction.sol";

contract myAuction is IAuction {
    
    struct User {
        string name;
        uint[] items; // store list of item ids
    }
    
    struct Item {
        string name;
        uint id; 
        address owner;
    }
    
    struct RegisteredItem {
        uint iid; // id of the item
        uint rid; // registration id
        uint bid_price;
        uint limit_price;
        uint due_date;
        address highest_bidder;
        bool closed;
    }

    
    uint next_iid = 0;
    
    mapping (address => User) internal _users; // address to user
    mapping (uint => Item) internal _items; // iid to item
    RegisteredItem[] internal _registered; // list of registered & closed items
    // ClosedItem[] internal _closed; // list of closed items
    
    function registerItem(string memory name) public {
        _items[next_iid] = Item({
            name: name,
            id: next_iid,
            owner: msg.sender
        });
        _users[msg.sender].items.push(next_iid);
        next_iid++;
    }
    function registerName(string memory name) public {
        require(!strCmp(name,""));
        _users[msg.sender].name = name;
    }
    function registerAuctionItem(string memory name, uint start_price, uint limit_price, uint date) public {
        // check data, 
        require (limit_price >= start_price);
        require (now * 1000 < date);
        
        
        // check one's possessing of the item
        User memory user = _users[msg.sender];
        bool found = false;
        uint iid = 0;
        for (uint i=0; i< user.items.length; i++) {
            if (strCmp(_items[user.items[i]].name,name)) {
                found = true;
                iid = _items[user.items[i]].id;
                break;
            }
        }
        // Item memory item = _items[iid];
        require(found);
        
        _registered.push(RegisteredItem ({
            iid: iid,
            rid: _registered.length,
            bid_price: start_price,
            limit_price: limit_price,
            due_date: date,
            highest_bidder: address(0),
            closed: false
        }));
    }
    function auctionBidding(uint aid) payable public {
        require(aid < _registered.length);
        RegisteredItem memory item = _registered[aid];
        require(now * 1000 <= item.due_date && !item.closed);
        require(msg.value > item.bid_price && msg.value <= item.limit_price);
    
        // sent back to the highest_bidder before
        address(uint160(item.highest_bidder)).transfer(item.bid_price);
        
        // change information
        _registered[aid].highest_bidder = msg.sender;
        _registered[aid].bid_price = msg.value;
        
        
        if (msg.value == item.limit_price) {
            auctionEnd(aid);
        }
    }
    
    function auctionEnd(uint aid) payable public {
        require(aid < _registered.length);
        
        RegisteredItem memory item = _registered[aid];
        
        require(now * 1000 >= item.due_date || item.bid_price == item.limit_price);
        
        // close the auction
        _registered[aid].closed = true;
        
        // send money to the seller
        address payable seller = address(uint160(_items[item.iid].owner));
        uint amount = item.bid_price;
        
        seller.transfer(amount);
        
        // balanceTransfer(seller, amount);
    }
    
    function balanceTransfer(address payable seller, uint price) payable public {
        seller.transfer(price);
    }
    
    function changeItemOwner(uint iid, address addr) public {
        require(msg.sender == _items[iid].owner);
        require(!strCmp(_users[addr].name, ""));
        
        _items[iid].owner = addr;
        _users[addr].items.push(iid);
        
    }
    function getMyItems() public view returns(string memory) {
        string memory ret = "[ ";
        uint cnt = 0;
        for (uint i = 0; i < _users[msg.sender].items.length; i++ ) {
            if (_items[_users[msg.sender].items[i]].owner != msg.sender){
                continue;
            }
            if(cnt != 0) {
                ret = strConcat(ret, ", ");
            }
            cnt++;
            ret = strConcat(ret, '"');
            ret = strConcat(ret, _items[_users[msg.sender].items[i]].name);
            ret = strConcat(ret, '"');
            // ret = strConcat(ret, ", ");
        }
        ret = strConcat(ret, "]");
        return ret;
    }
    function getName() public view returns(string memory){
        return _users[msg.sender].name;   
    }
    
    function toJsonField(string memory field, string memory value) internal view returns (string memory) {
        string memory ret = "";
        ret = strConcat(ret, '"');
        ret = strConcat(ret, field);
        ret = strConcat(ret, '"');
        ret = strConcat(ret, ': "');
        ret = strConcat(ret, value);
        ret = strConcat(ret, '"');
        // ret = strConcat(ret, '", ');
        return ret;
    }
    
    function getAllRegisteredItems() public view returns(string memory){
        string memory ret = "[";
        uint cnt = 0;
        for (uint i = 0; i < _registered.length; i++) {
            RegisteredItem memory item = _registered[i];
            if (item.closed) {
                continue;
            }
            if(cnt != 0) {
                ret = strConcat(ret, ", ");
            }
            cnt++;
            ret = strConcat(ret, "{ ");
            ret = strConcat(ret, toJsonField("item", _items[item.iid].name));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("rid",  uint2str(item.rid)));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("owner", _users[_items[item.iid].owner].name));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("bid_price", uint2str(item.bid_price)));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("upper_limit_price", uint2str(item.limit_price)));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("due_date", uint2str(item.due_date)));
            ret = strConcat(ret, "}");
        }
        ret = strConcat(ret, "]");
        return ret;
    }
    function getAllAuctionedItems() public view returns(string memory){
        string memory ret = "[";
        uint cnt = 0;
        for (uint i=0; i< _registered.length; i++) {
            RegisteredItem memory item = _registered[i];
            if (!item.closed) {
                continue;
            }
            if(cnt != 0) {
                ret = strConcat(ret, ", ");
            }
            cnt++;
            ret = strConcat(ret, "{ ");
            ret = strConcat(ret, toJsonField("item", _items[item.iid].name));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("rid",  uint2str(item.rid)));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("owner", _users[_items[item.iid].owner].name));
            ret = strConcat(ret, ", ");
            ret = strConcat(ret, toJsonField("winning_bid", uint2str(item.bid_price)));
            ret = strConcat(ret, "}");
        }
        ret = strConcat(ret, "]");
        return ret;
    }
    
    function strCmp(string memory s1, string memory s2) internal view returns (bool) {  return (keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2)));}
    function strConcat(string memory s1, string memory s2) internal view returns (string memory) { return string(abi.encodePacked(s1, s2)); }
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
    function bool2str(bool b) internal pure returns (string memory){
        if(b) {
            return "true";
        } else {
            return "false";
        }
    }
}