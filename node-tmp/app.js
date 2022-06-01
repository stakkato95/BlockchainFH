const express = require('express')
const app = express()
const port = 3000
app.use(express.json())

var Web3 = require("web3")
var Web3Quorum = require("web3js-quorum")
var web3 = new Web3Quorum(new Web3("http://localhost:8545"))

const Tx = require("ethereumjs-tx").Transaction;
const Common = require('@ethereumjs/common').default
const customCommon = Common.forCustomChain(
    'mainnet',
    {
        name: 'k8s',
        networkId: 1981,
        chainId: 1981,
    },
    'istanbul',
);

const ABI = require("./abi.json")

const fromAccountPublicKey = "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73"
const fromAccountPrivateKey = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
const deployedContractAddress = "0x9a3DBCa554e9f6b9257aAa24010DA8377C57c17e"
var notaryInstace = new web3.eth.Contract(ABI, deployedContractAddress)

const addEntryAbi = notaryInstace._jsonInterface.find((e) => {
    return e.name === "addEntry";
});

app.get('/chain/entry/:hash', async (req, res) => {
    const hash = req.params['hash']

    var result = await notaryInstace.methods.getEntry(hash).call({ from: fromAccountPublicKey });

    const response = {
        filename: result['0'],
        timestamp: result['1'],
        comment: result['2'],
        hash: result['3']
    }
    res.send(response)
})

app.post('/chain/entry', async (req, res) => {
    const hash = req.body['hash']
    const filename = req.body['filename']
    const comment = req.body['comment']

    const [nonce, signedTx, result] = await addEntry(hash, filename, comment)
    const response = {
        nonse: nonce,
        signedTx: signedTx,
        result: result
    }
    res.send(response)
})

async function addEntry(hashVal, filename, comment) {
    var publicNonce = await web3.eth.getTransactionCount(fromAccountPublicKey, "pending");

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // creating call for addEntry() function
    const addEntryFunctionArgs = web3.eth.abi
        .encodeParameters(addEntryAbi.inputs, [hashVal, filename, comment])
        .slice(2);

    var rawTx = {
        nonce: web3.utils.numberToHex(publicNonce),
        from: fromAccountPublicKey,
        value: 0,
        to: deployedContractAddress,
        data: `${addEntryAbi.signature + addEntryFunctionArgs}`,
        gasPrice: "0xFFFFFF",
        gasLimit: "0xFFFFF",
    };
    var tx = new Tx(rawTx, { common: customCommon });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var privateKey = Buffer.from(fromAccountPrivateKey, "hex");
    tx.sign(privateKey);
    var serializedTx = tx.serialize();
    var signedTx = `0x${serializedTx.toString("hex")}`;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var result = await web3.eth.sendSignedTransaction(signedTx);

    return [publicNonce, signedTx, result]
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})