var exports = module.exports = {};

// Imports
require('dotenv').config();
const url = require('url');
const fetch = require('node-fetch');
const mock = require('./mock');

// Set moltin baseURL (can change per customer)
const baseURL ='https://api.moltin.com';

// Manual authentication (needed for FaaS)
const authenticate = function() {

	const client_id = process.env.MOLTIN_CLIENT_ID;

	// Setup correct formURL params
	const params = new url.URLSearchParams();
	params.append('grant_type', 'implicit');
	params.append('client_id', client_id);
		
	return new Promise(function(resolve, reject){
		fetch(baseURL + '/oauth/access_token', { method: 'POST', body: params })
	    .then(res => res.json())
	    .then(json => {
	    	resolve(json.access_token);
	    })
	    .catch(e => {
	    	reject(e);
	    })
	});
};

// Manually fetch your products (needed for FaaS)
const getProduct = function () {

	return new Promise(function(resolve, reject){

		authenticate()
		.then((token) => {

			fetch(baseURL + '/v2/products', { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': token }})
		    .then(res => res.json())
		    .then(json => {
		    	resolve(json);
		    })
		    .catch(e => {
		    	reject(e);
		    })
		})

	});
};

// Manual add to a cart (needed for FaaS)
const addToCart = function (productID, quantity) {

	let body = JSON.stringify({

		data: {
			'type': 'cart_item',
			'id': productID,
			'quantity': quantity
		};
	});
	
	return new Promise(function(resolve, reject){

	authenticate()
		.then((token) => {

			fetch(baseURL + '/v2/carts/test/items', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: body})
		    .then(res => res.json())
		    .then(json => {
		    	resolve(json);
		    })
		    .catch(e => {
		    	reject(e);
		    })
		})
	});
};

// Manual checkout (needed for FaaS)
const checkout = function (customer, billing_address, shipping_address) {

	let body = JSON.stringify({

		data: {
			'customer': customer,
			'billing_address': billing_address,
			'shipping_address': shipping_address
		};
	});

	return new Promise(function(resolve, reject){

	authenticate()
		.then((token) => {

			fetch(baseURL + '/v2/carts/test/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: body})

		    .then(res => res.json())
		    .then(json => {
		    	resolve(json);
		    })
		    .catch(e => {
		    	reject(e);
		    })
		})
	});
};

// Manually pay (needed for FaaS)
const payment = function (orderID, method, gateway, card) {

	let body = JSON.stringify({

		data: {
			'method': method,
			'gateway': gateway,
			'number': card.number,
			'month': card.month,
			'year': card.year,
			'verification_value': card.verification_value,
		};
	});
	
	return new Promise(function(resolve, reject){

	authenticate()
		.then((token) => {
			fetch(baseURL + '/v2/orders/' + orderID + '/payments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: body})
		    .then(res => res.json())
		    .then(json => {
		    	resolve(json);
		    })
		    .catch(e => {
		    	reject(e);
		    })
		})
	});
};

// Moltin handler for full checkout process
exports.purchase = async function() {

  try {
    // Add the item to a cart
    var Products = await getProduct();

    // Add the first product to a cart
    var Cart = await addToCart(Products.data[0].id, 1);

    // checkout the cart
    var Checkout = await checkout(
      mock.customer,
      mock.address, 
      mock.address
    );

    var Payment = await payment(
    Checkout.data.id,
    "purchase",
    "stripe",
    mock.card
    );

    return(Payment);

   } catch(e) {
    return('err');
    console.log(e);
   }
};