// code examples
// https://github.com/ethereumjs/ethereumjs-tx/blob/master/examples/custom-chain-tx.ts
// https://github.com/ConsenSys/web3js-quorum/blob/01e5af984ac7a217a49f79376981483fc2fe5f13/example/accessPublicState/deployContract.js
// https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#sendsignedtransaction

// use private network
// https://github.com/ethereumjs/ethereumjs-tx/blob/master/docs/interfaces/transactionoptions.md
// https://ethereum.stackexchange.com/questions/85132/how-to-use-private-blockchains-in-ethereumjs-tx2-1-2

var Web3 = require("web3");
var Web3Quorum = require("web3js-quorum");
var web3 = new Web3Quorum(new Web3("http://localhost:8545"));

const Tx = require("ethereumjs-tx").Transaction;
const Common = require('@ethereumjs/common').default

let transferEther = async () => {
    const fromAccountPublicKey = "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73";
    const fromAccountPrivateKey = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";

    const publicNonce = await web3.eth.getTransactionCount(fromAccountPublicKey, "pending");
    console.log(`nonce: ${publicNonce}`)

    const txSum = web3.utils.toWei('50', 'ether');
    const txSumHex = `0x${Number(txSum).toString(16)}`;

    const rawTx = {
        nonce: web3.utils.numberToHex(publicNonce),
        from: fromAccountPublicKey, //Account 4 
        to: "0x419938B0CdeDA1358457Bcee328f96D04771dD9E",   //Account 1
        value: txSumHex,// `0x${transactionSum.toString(16)}`,
        gasPrice: "0xFFFFF",
        gasLimit: "0xFFFFFF",
    };

    const customCommon = Common.forCustomChain(
        'mainnet',
        {
            name: 'k8s',
            networkId: 1981,
            chainId: 1981,
        },
        'istanbul',
    );
    const tx = new Tx(rawTx, { common: customCommon });

    //private key of Account 4 
    let privateKey = Buffer.from(fromAccountPrivateKey, "hex");
    tx.sign(privateKey);
    const serializedTx = tx.serialize();

    let signedTx = `0x${serializedTx.toString("hex")}`;
    console.log(`signed tx: ${signedTx}`);

    let result = await web3.eth.sendSignedTransaction(signedTx);
    console.log(result);
};

transferEther();