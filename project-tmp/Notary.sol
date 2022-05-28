pragma solidity ^0.4.24;

contract NotaryContract {

    struct NotaryEntry {
        string filename;
        uint timestamp;
        bytes32 checksum;
        string comments;
        bool isSet;
        address setBy;
    }

    mapping(bytes32 => NotaryEntry) notaryMapping;

    //search is enabled for indexed params
    event NewEntry(bytes32 _checksum, string _filename, address indexed _setBy);

    function getEntry(bytes32 _checksum) public view returns(string, uint, string, address) {
        require(notaryMapping[_checksum].isSet);
        return (notaryMapping[_checksum].filename, notaryMapping[_checksum].timestamp, notaryMapping[_checksum].comments, notaryMapping[_checksum].setBy);
    }

    /**
     * Example: 0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08, "testFile", "test comment"
     **/
    function addEntry(bytes32 _checksum, string _filename, string _comments) public {
        require(!notaryMapping[_checksum].isSet);

        notaryMapping[_checksum].isSet = true;
        notaryMapping[_checksum].filename = _filename;
        notaryMapping[_checksum].timestamp = now;
        notaryMapping[_checksum].comments = _comments;
        notaryMapping[_checksum].setBy = msg.sender;
        notaryMapping[_checksum].checksum = _checksum;

        emit NewEntry(_checksum, _filename, msg.sender);
    }
}