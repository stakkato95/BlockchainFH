var Web3 = require("web3");
var Web3Quorum = require("web3js-quorum");
var web3 = new Web3Quorum(new Web3("http://localhost:8545"));

const Tx = require("ethereumjs-tx").Transaction;
const Common = require('@ethereumjs/common').default

const ABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_checksum",
                "type": "bytes32"
            },
            {
                "name": "_filename",
                "type": "string"
            },
            {
                "name": "_comments",
                "type": "string"
            }
        ],
        "name": "addEntry",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_checksum",
                "type": "bytes32"
            }
        ],
        "name": "getEntry",
        "outputs": [
            {
                "name": "",
                "type": "string"
            },
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "string"
            },
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_checksum",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "_filename",
                "type": "string"
            },
            {
                "indexed": true,
                "name": "_setBy",
                "type": "address"
            }
        ],
        "name": "NewEntry",
        "type": "event"
    }
];

const customCommon = Common.forCustomChain(
    'mainnet',
    {
        name: 'k8s',
        networkId: 1981,
        chainId: 1981,
    },
    'istanbul',
);

let communicateWithContract = async () => {
    const fromAccountPublicKey = "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73";
    const fromAccountPrivateKey = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";

    var publicNonce = await web3.eth.getTransactionCount(fromAccountPublicKey, "pending");
    console.log(`nonce: ${publicNonce}\n`);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var deployedContractAddress = "0xB8D75b20396A47B632B0675524C00091F445F7d0";
    var notaryInstace = new web3.eth.Contract(ABI, deployedContractAddress);
    
    // creating call for addEntry() function
    const addEntryAbi = notaryInstace._jsonInterface.find((e) => {
        return e.name === "addEntry";
    });
    const hashVal = "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a11";
    const addEntryFunctionArgs = web3.eth.abi
        .encodeParameters(addEntryAbi.inputs, [hashVal, "testFile123456789", "test comment 123456789"])
        .slice(2);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    console.log(`signed tx: ${signedTx}\n`);

    var result = await web3.eth.sendSignedTransaction(signedTx);
    console.log(result);
    console.log();

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // // creating call for addEntry() function
    // const getEntryAbi = notaryInstace._jsonInterface.find((e) => {
    //     return e.name === "getEntry";
    // });
    // const getEntryFunctionArgs = web3.eth.abi
    //     .encodeParameters(addEntryAbi.inputs, [hashVal])
    //     .slice(2);

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // var publicNonce = await web3.eth.getTransactionCount(fromAccountPublicKey, "pending");
    // console.log(`nonce: ${publicNonce}\n`);

    // var rawTx = {
    //     nonce: web3.utils.numberToHex(publicNonce),
    //     from: fromAccountPublicKey,
    //     value: 0,
    //     to: deployedContractAddress,
    //     data: `${getEntryAbi.signature + getEntryFunctionArgs}`,
    //     gasPrice: "0xFFFFFF",
    //     gasLimit: "0xFFFFF",
    // };
    // var tx = new Tx(rawTx, { common: customCommon });

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // var privateKey = Buffer.from(fromAccountPrivateKey, "hex");
    // tx.sign(privateKey);
    // var serializedTx = tx.serialize();

    // var signedTx = `0x${serializedTx.toString("hex")}`;
    // console.log(`signed tx: ${signedTx}\n`);

    // var result = await web3.eth.sendSignedTransaction(signedTx);
    // console.log(result);
    // console.log();
};

communicateWithContract();