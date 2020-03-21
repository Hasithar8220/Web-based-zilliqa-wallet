const express = require('express');
const upload = require("express-fileupload");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session= require('express-session');

//Calling walletData service 
const walletData = require('./services/ZilliqaService.js');

const app = express();


app.use(upload());
app.use(session({secret: "Shh, its a secret!"}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {

if(req.session.loggedIn){
  authHandler(req.session.address,res,req);
}else{
  res.render('auth', {});
}

   
});


app.get('/send', function (req, res) {

        res.render('send', {});
     
});


app.get('/auth', function (req, res) {

  res.render('auth', {});

});

app.get('/viewhistory', function (req, res) {

  res.render('viewhistory', {data:null});

});

app.get('/success', function (req, res) {

  res.render('success', {});

});

app.get('/failure', function (req, res) {

  res.render('failure', {});

});


app.get('/logout',(req,res) => {
  req.session.destroy((err) => {
      if(err) {
          return console.log(err);
      }
      res.redirect('/');
  });

});

app.post("/authWallet", function(req, res) {
 
 let sess=req.session;
 let json = req.files.keyUploader.data.toString('utf8');
 let passPhrase=req.body.passPhrase;
  console.log(json);
 let wData = new walletData();
 //pass key data to validate address
 wData.addKeystoreFile(json,passPhrase).then((data) => {
 
  if(data==0){
   console.log('Invalid');
   res.render('failure');
  }else{
    console.log('Auth Ok');
    sess.loggedIn=true;
    sess.address=data;
    authHandler(data,res,req);
    //Test
    //wData.getRecentTransactions(data);
  }

});  

});

app.post('/sendTransaction', function (req, res) {
   
    let toAddr = req.body.toAddr.trim();
    let amount = req.body.amount.trim();
    let wData = new walletData();
    
    wData.transaction(toAddr,amount,req).then((data)=>{
      if(data == 0){

      }else{
        console.log('success');
        res.render('success');  
      }
    
    
    });
    
    //res.render('success');  
  });


  app.post('/loadHistory', function (req, res) {
   
    let wData = new walletData();   
    let arr=wData.getRecentTransactions();
    
    res.render('viewHistory',{data:arr});  
  });



app.post('/', function (req, res) {
  console.log(req.body.city);
  res.render('index');  
});
app.listen(3000, function () {
  console.log('Wallet app listening on porttt 3000!')
});

//Handler method 
const authHandler= function (address,res, req){
  let wData = new walletData();
  //Wait till balance to serve the page
  wData.getBalance(address).then((data) => {
   let viewData={};
   viewData.balance=parseInt(data.balance)*0.000000000001;
   viewData.nonce=data.nonce;
   viewData.address=address;
  req.session.nonce=data.nonce;
      res.render('index', {data: viewData, error: null});
   });  
}