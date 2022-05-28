pragma solidity ^0.4.24;

contract MappingsContract {

    mapping(address => MyStruct) public myMapping;

    struct MyStruct {
        uint timestamp;
        uint counter;
    }

    function structFun() public {
        myMapping[msg.sender].timestamp = now;
        myMapping[msg.sender].counter++;
    }
}