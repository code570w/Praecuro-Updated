const { onPossiblyUnhandledRejection } = require('bluebird');
var mongoose = require('mongoose');
var Config = require('../config/config');
// const stripe = require('stripe')('sk_test_51HfIFdJlkFHXRZkLb0UNrZ2bjv9TFoFd4tGpYCjK8feEsx0IZASlcfmlXCAanKZwaniLtI64kJscdqZaTybXRHvI00KPxn1zOT');
const stripe = require('stripe')('sk_test_51JpZHoESImW743YHZDXVzbv136Dq2OoWCsrmfIPkR5HaBoIIE3cG5wiW2ixnuUpzKwBgwPCXODgoXS64GAcCpTPS008PK5wUSy');


// const stripe = require('stripe')('sk_test_OJvo9v9hnM2EgTCcfzBh2skZ006DjFJIEw');
const Payment = mongoose.model('Payment');
const Source = mongoose.model('Source');
const Customer = mongoose.model('Customer');
exports.createCustomerSource = async(req, res)=>{
  console.log('-createcustomer-')
  const customer = await stripe.customers.create({
    email: req.body.email,
    source: req.body.source,
  });
  console.log(customer)
  Customer.findOne({email:req.body.email}).then((cate) => {
    if(cate){
      return res.json({success: false, errMessage: "Already Exist"});
    }else{
      let newNurse = new Customer({
        source:req.body.source,
        customer:customer,
        email:req.body.email
      });
      newNurse.save(async(err) => {
          if (err) {
              console.log('err',err)
              return res.json({success: false, errMessage: "Unknown errors"});
          } else {
            res.status(200).json({success:true,customer:newNurse});
          }
      }); 
    }
})
}
exports.createSource =  async(req, res) =>  {  
  console.log('-- addpayment --')
  const source = await stripe.sources.create({
    type: "ach_credit_transfer",
    currency: "usd",
    owner: {email: "praecuroapp@gmail.com"},
  });
  Source.findOne({email:req.body.email}).then((cate) => {
    if(cate){
      return res.json({success: false, errMessage: "Already Exist"});
    }else{
      let newNurse = new Source(source);
      newNurse.save(async(err) => {
          if (err) {
              console.log('err',err)
              return res.json({success: false, errMessage: "Unknown errors"});
          } else {
            res.status(200).json({success:true,source:newNurse});
          }
      }); 
    }
})
}
// crate token
exports.createToken = (req, res) =>{
    console.log('------ Create Toekn --------')
    console.log(stripe)
    stripe.createToken('bank_account', {
    country: 'US',
    currency: 'usd',
    routing_number: '110000000',
    account_number: '000123456789',
    account_holder_name: 'Jenny Rosen',
    account_holder_type: 'individual',
  })
  .then(function(result) {
      console.log('result',result)
      console.log('--------------------')
      // Handle result.error or result.token
  });
}
// create customer
exports.createCustomer=  async(req, res) =>  {  
    console.log('------ Create Customer --------')
    // Get the bank token submitted by the form
    var tokenID = req.body.stripeToken;
    // Create a Customer
    const customer = await stripe.customers.create({
        description: 'Example customer',
        source: tokenID,
    });
    console.log('customer', customer)
    console.log('--------------------')

}
// verify Source
exports.verifySource=  (req, res) =>  {  
    console.log('------ verifySource --------')
    const bankAccount = stripe.customers.verifySource(
        req.body.cus,
        req.body.ba,
        {
          amounts: [32, 45],
        }
      );
    console.log('bankAccount', bankAccount)
    console.log('--------------------')
}
// charge create
exports.createCharge=  async(req, res) =>  {  
    console.log('------ createCharge --------')
    const charge = await stripe.charges.create({
        amount: req.body.amount,
        currency: req.body.currency,
        customer: req.body.cus,
    });
    console.log('charge', charge)
    console.log('--------------------')
}
// charge create
exports.createChargeConnect=  async(req, res) =>  {  
    console.log('------ createChargeConnect --------')
    const charge = await stripe.charges.create({
        amount: 1500,
        currency: 'usd',
        customer: customerId, // Previously stored, then retrieved
        transfer_data: {
          amount: 850,
          destination: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
        },
      });
    console.log('charge', charge)
    console.log('--------------------')
}



exports.getAll = async (req, res) =>  {
  await Payment.find()
       .populate(['job', 'nurse','client'])
      .exec(function(err, users) {
      if (err) {
          return res.json({success: false, errMessage: "Unknown errors occurred while getting all Jobs."});
      } else {
          return res.json({success: true, payments: users});
      }
  });

};
