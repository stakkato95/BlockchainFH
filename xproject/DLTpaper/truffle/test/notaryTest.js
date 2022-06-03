var NotaryArtifact = artifacts.require("Notary");

const hash = "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const filename = "testFile";
const comment = "test comment";

contract("Notary", function (accounts) {
    console.log(accounts);

    // it('This is my TestCase', function () {
    //     return NotaryArtifact.deployed().then(function (instance) {
    //         // //here we can access deployed cotract instacne
    //         // console.log(instance);
    //     });
    // })

    it('should not have an entry for an unknown hash', async function () {
        return NotaryArtifact.deployed().then(async function (instance) {
            try {
                await instance.getEntry(hash);
            } catch (error) {
                if (error.message.search("revert") >= 0) {
                    assert.equal(error.message.search("revert") >= 0, true, "Error message does not reflect expected exception.");
                } else {
                    throw error;
                }
            }
        });
    });

    it('should have an entry for a known hash', async function() {
        let instance = await NotaryArtifact.deployed();
        await instance.addEntry(hash, filename, comment);
        let entry = await instance.getEntry(hash);
        // console.log(entry);

        assert.equal(entry[0], filename, `Filename should be ${filename}`);
        assert.equal(entry[1].toNumber() >= 1, true, "Timestamp should be bigger than 1");
        assert.equal(entry[2], comment, `Comment should be ${comment}`);
        assert.equal(entry[3], accounts[0], "Transaction should be sent from account 0");
    });
});