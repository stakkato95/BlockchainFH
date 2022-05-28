pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Notary.sol";

contract NotaryTest {

    bytes32 constant checksum = 0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08;
    string constant filename = "testFile";
    string constant comment = "test comment";

    function testAddAndRead() public {
        Notary notaryContract = Notary(DeployedAddresses.Notary());
        notaryContract.addEntry(checksum, filename, comment);

        string memory actualFilename;
        uint timestamp;
        string memory actualComment;
        address actualSender;
        (actualFilename, timestamp, actualComment, actualSender) = notaryContract.getEntry(checksum);
        Assert.equal(actualFilename, filename, "wrong filename");
        Assert.equal(actualComment, comment, "wrong comment");
        Assert.equal(actualSender, address(this), "wrong sender");
    }
}