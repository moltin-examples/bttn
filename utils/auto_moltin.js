var exports = module.exports = {};
const MoltinGateway = require('@moltin/sdk').gateway;

const Moltin = MoltinGateway({
  client_id: process.env.MOLTIN_CLIENT_ID
});

const mock = require('./mock');

exports.purchase = async function() {

    try {
      var Products = await Moltin.Products.All();

      var Cart = await Moltin.Cart("test").AddProduct(Products.data[0].id, 1);

      var Checkout = await Moltin.Cart("test").Checkout(mock.customer, mock.address);
   
      var Payment = await Moltin.Orders.Payment(Checkout.data.id, {
        gateway: "stripe",
        method: "purchase",
        first_name: "John",
        last_name: "Smith",
        number: "4242424242424242",
        month: "10",
        year: "2020",
        verification_value: "123"
      });

      return(Payment);
    }

    catch(e) {
      return('err');
    };
};