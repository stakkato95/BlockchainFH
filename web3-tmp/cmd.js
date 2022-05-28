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

await web3.eth.getAccounts();
await web3.eth.net.getId();
web3.eth.accounts.privateKeyToAccount("0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63")