var exports = module.exports = {};

const createClient = require('@moltin/request').createClient
 
const client = new createClient({
  client_id: process.env.MOLTIN_CLIENT_ID
})

const product_id = process.env.MOLTIN_PRODUCT_ID

const mock = require('./mock');

exports.purchase = async function() {

    try {
      let cartID = Math.random().toString(36).substring(7);

      var Cart = await client.post('carts/' + cartID + '/items', {
        type: 'cart_item',
        quantity: 1,
        id: product_id
      })

      var Checkout = await client.post('carts/' + cartID + '/checkout', {
        customer: mock.customer,
        billing_address: mock.address,
        shipping_address: mock.address
      })

      let orderID = Checkout.data.id;

      var Payment = await client.post('orders/' + orderID + '/payments', {
        gateway: "stripe",
        method: "purchase",
        first_name: "John",
        last_name: "Smith",
        number: "4242424242424242",
        month: "10",
        year: "2020",
        verification_value: "123"
      })

      return(Payment);
    }

    catch(e) {
      console.log(e);
      return('err');
    };
};

exports.purchase()