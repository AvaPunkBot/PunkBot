var Web3 = require('web3');
let fs = require("fs");
require('dotenv').config();

const  config = {
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET
}

const twit =  require('twit')
const T = new twit(config)

let source = fs.readFileSync("abi.json");
let abi = JSON.parse(source)["abi"];

const options = {
    timeout: 30000, // ms

    clientConfig: {
     // Useful to keep a connection alive
      keepalive: true,
      keepaliveInterval: 60000 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};


var provider = new Web3.providers.WebsocketProvider('wss://api.avax.network/ext/bc/C/ws', options);
web3js = new Web3(provider);

var address = '0xE935193fE3E9580f6796302C5F33a1f6Cc1A7b4E';
contract = new web3js.eth.Contract(abi, address);

contract.events.Assign({
    fromBlock: 658010
}, function(error, event){ console.log(event); })
.on("connected", function(subscriptionId){
    console.log(subscriptionId);
})
.on('data', function(event){
    //console.log(event); 
    let url = 'https://avalanchepunks.com/token/'+event['returnValues']['punkIndex'];
    let data = "#NFT #avalanchepunks \nPunk #"+event['returnValues']['punkIndex']+" has been assigned to "+event['returnValues']['to']+" !\n"+url+" @avalanchepunks";
    T.post('statuses/update', { status: data });
})
.on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.log(error);
});


contract.events.PunkBought({
    fromBlock: 658010
}, function(error, event){ console.log(event); })
.on("connected", function(subscriptionId){
    console.log(subscriptionId);
})
.on('data', function(event){
    console.log(event); 
    let url = 'https://avalanchepunks.com/token/'+event['returnValues']['punkIndex'];
    let data = "#NFT #avalanchepunks \nPunk #"+event['returnValues']['punkIndex']+" has been bought from "+  event['returnValues']['fromAddress'] + " to "+event['returnValues']['toAddress']+' !\n'+url+" @avalanchepunks";    
    T.post('statuses/update', { status: data });
})
.on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.log(error);
});
