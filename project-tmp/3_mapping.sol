pragma solidity ^0.4.24;

contract MappingsContract {

    mapping(uint => bool) public myMapping;

    function writeVal(uint _myInt) public {
        myMapping[_myInt] = true;
    }
}