var mongoose = require('mongoose');
var Config = require('../config/config');
// Job Management
exports.addPayment=  (req, res) =>  {  
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