const { Transaction } = require('@zilliqa-js/account');
const { BN, Long, bytes, units } = require('@zilliqa-js/util');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const {
  toBech32Address,
  getAddressFromPrivateKey,
} = require('@zilliqa-js/crypto');

const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
const pify = require('pify');
const fs = require('fs');
var localStorage = require('node-localstorage').LocalStorage,
localStorage = new localStorage('./scratch');


// These are set by the core protocol, and may vary per-chain.
// You can manually pack the bytes according to chain id and msg version.
// For more information: https://apidocs.zilliqa.com/?shell#getnetworkid

const chainId = 333; // chainId of the developer testnet
const msgVersion = 1; // current msgVersion
const VERSION = bytes.pack(chainId, msgVersion);

// Populate the wallet with an account
//const privateKey =
 // '3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8';

//zilliqa.wallet.addByPrivateKey(privateKey);

//const address = getAddressFromPrivateKey(privateKey);

//const address ='0xA9eB343dF14f0B3F9528E96E298451f09b70A7A5';

//console.log(`My account address is: ${address}`);
//console.log(`My account bech32 address is: ${toBech32Address(address)}`);

class walletData {

  constructor() {
    
}


///get Account Balance
   async getBalance(address) {

 
       // Get Balance
    const balance = await zilliqa.blockchain.getBalance(address);
    // Get Minimum Gas Price from blockchain
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();

    // Account balance (See note 1)
    console.log(`Your account balance is:`);
    console.log(balance);
    console.log(balance.result);
    
      return balance.result;

      
    }

    
///Get Transactions Hostory
     getRecentTransactions(){

     // const txs = await zilliqa.blockchain.getRecentTransactions();

      let ids=localStorage.getItem('txids');
      var res = ids.split(',');
      var outPut=[];

      res.forEach(async (item)=>{

        try {
          const tx = await zilliqa.blockchain.getTransaction(
            item,
          );
          console.log(tx.getReceipt());
          outPut.push(tx);
          
        } catch (e) {
          console.log(e);
        }
  
      });


      return outPut;
      
      
    }

    async getRecentTransactionsByAddress(){

      // Not Implemented
      try {
        const tx = await zilliqa.blockchain.getTransaction(
          '3f3459c8c7751ebb71c72ed70cc4e9cbde2f2936ce0e694cd60bae85bf0f687b',
        );
        console.log(tx.getReceipt());
      } catch (e) {
        console.log(e);
      }

    }

     async addKeystoreFile(json,passphrase) {
  
     
      const address = await zilliqa.wallet.addByKeystore(json, passphrase).catch((err)=>{
        return 0;
      });
           
       console.log(`My account address is: ${address}`);
      // console.log(`My account bech32 address is: ${toBech32Address(address)}`);
      localStorage.setItem('txids', '');
      
       return address;
     }



    async transaction(toAddr,amount){


      const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();
      const myGasPrice = units.toQa('1000', units.Units.Li); // Gas Price that will be used by all transactions
      const isGasSufficient = myGasPrice.gte(new BN(minGasPrice.result)); // Checks if your gas price is less than the minimum gas price

      console.log('AddressTo:'+ toAddr);
      console.log(amount.toString());

      console.log(`Is the gas price sufficient? ${isGasSufficient}`);


            if(!isGasSufficient)
               return 0;

      console.log(VERSION+':'+toAddr+':'+myGasPrice);
     
      zilliqa.blockchain.createTransaction()

      const tx = await zilliqa.blockchain.createTransactionWithoutConfirm(
        // Notice here we have a default function parameter named toDs which means the priority of the transaction.
        // If the value of toDs is false, then the transaction will be sent to a normal shard, otherwise, the transaction.
        // will be sent to ds shard. More info on design of sharding for smart contract can be found in.
        // https://blog.zilliqa.com/provisioning-sharding-for-smart-contracts-a-design-for-zilliqa-cd8d012ee735.
        // For payment transaction, it should always be false.
        zilliqa.transactions.new(
          {
            version: VERSION,
            toAddr: toAddr,
            amount: new BN(units.toQa(amount.toString(), units.Units.Zil)), // Sending an amount in Zil (1) and converting the amount to Qa
            gasPrice: myGasPrice, // Minimum gasPrice veries. Check the `GetMinimumGasPrice` on the blockchain
            gasLimit: Long.fromNumber(1),
          },
          false,
        ),
      ).catch((err)=>{
         return 0;
      });

      const pendingStatus = await zilliqa.blockchain.getPendingTxn(tx.id);
    console.log(`Pending status is: `);
    console.log(pendingStatus.result);


      //Store TX Id: Just a temp work around not a good solution
      if(localStorage.getItem('txids') && localStorage.getItem('txids').length > 0){
      let ids= localStorage.getItem('txids')+ ","+tx.id.toString();

console.log(ids);

      localStorage.removeItem('txids');
      localStorage.setItem('txids',ids);

      }else{
        localStorage.setItem('txids',tx.id.toString());
      }

      console.log(localStorage.getItem('txids'));

      return tx.id;

    }


    async receiveTransaction(address){

  

    }



}


module.exports = walletData;