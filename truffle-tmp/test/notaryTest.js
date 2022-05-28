var NotaryArtifact = artifacts.require("Notary");

contract("Notary", function (accounts) {
    // console.log(accounts);

    it('This is my TestCase', function () {
        return NotaryArtifact.deployed().then(function (instance) {
            // //here we can access deployed cotract instacne
            // console.log(instance);
        });
    })

    it('should not have an entry for an unknown hash', async function () {
        return NotaryArtifact.deployed().then(async function (instance) {
            try {
                await instance.getEntry("0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
            } catch (error) {
                if (error.message.search("revert") >= 0) {
                    assert.equal(error.message.search("revert") >= 0, true, "Error message does not reflect expected exception.");
                } else {
                    throw error;
                }
            }
        });
    });
});