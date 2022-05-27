pragma solidity ^0.4.24;

contract MyContract {

    bool writeable;

    modifier mustBeWriteable() {
        require(writeable);
        _;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function withdrawEverything() public mustBeWriteable {
        msg.sender.transfer(getBalance());
    }

    function setWriteable(bool _writeable) public {
        writeable = _writeable;
    }

    function() public payable {

    }
}