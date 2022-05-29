//documentation
//https://github.com/ChainSafe/web3.js
//https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html

//besu specific
//https://besu.hyperledger.org/en/stable/HowTo/Interact/Client-Libraries/web3js-quorum/
//https://github.com/ConsenSys/web3js-quorum
//https://consensys.github.io/web3js-quorum/latest/index.html
//https://github.com/ConsenSys/web3js-quorum/tree/master/example


var Web3 = require("web3");
var Web3Quorum = require("web3js-quorum");
var web3 = new Web3Quorum(new Web3("http://localhost:8545"));

web3.eth.getAccounts().then((result) => {
    console.log(`accounts: "${result}"`);
});

web3.eth.net.getId().then((result) => {
    console.log(`netId: "${result}"`);
});

let address = web3.eth.accounts.privateKeyToAccount("0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63").address;
console.log(address);

// web3.eth.sendTransaction({
//     from: '0x419938B0CdeDA1358457Bcee328f96D04771dD9E', 
//     to: '0xbf58AF8127c9BFaFB71759ec3a2BD5866Dd4ED2c',
//     value: web3.utils.toWei('40', 'ether') 
// });

