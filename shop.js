const productModel = require('../model/productModel');
const Product = require('../model/productModel');
const Order = require('../model/orderModel');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var mail = {
    auth: {
        api_key: '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'
    }
}

var mailer = nodemailer.createTransport(sgTransport(mail));

exports.getShop = (req, res, next) => {
    Product.find()
    .then(product => {
        // console.log(product,'7')
        res.render('product',{
            title: 'Shop', 
            isAuth: req.session.isLoggedIn,
            path: '/product',
            products: product,
        })
    })
    .catch(err => console.log(err));
    
};

exports.getProduct = (req, res, next ) => {
    const prodsId = req.params.prodsId
    Product.findById(prodsId)
    .then(product => {
        // console.log(product,'23')
        res.render('product_detail',{
            product: product,
            title: product.productTitle,
            path: '/product',
            isAuth: req.session.isLoggedIn
        })
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
        const products = user.cart.items;
        res.render('cart', {
          path: '/cart',
          title: 'Your Cart',
          products: products,
          isAuth: req.session.isLoggedIn
        });
      })
      .catch(err => console.log(err));
  };

exports.postCart = (req, res, next) => {
    const prodId = req.body.prodsId;
    Product.findById(prodId)
    .then(product => {
        // console.log(product,'49')
        return req.user.addToCart(product);
    }).then(result => {
        console.log(result);
        res.redirect('/cart')
    })
    .catch(err => console.log(err));
}

exports.postDeleteCart = (req, res, next) => {
    const prodId = req.body.productId;
    console.log(prodId,'65')
    req.user
    .removeFromCart(prodId)
    .then(result => {
        console.log('Delete Success From Cart');
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
    let products;
    let totel =0;
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        products = user.cart.items;
        total = 0;
        products.forEach(p => {
            total += p.quantity * p.productId.price;
        });
    }).then(session => {
        res.render('checkout',{
            path: '/checkout',
            title: 'Checkout',
            products: products,
            totalSum: total,
            isAuth: req.session.isLoggedIn
            // sessionId: session._id
        })
    })
    .catch(err => console.log(err));
};

exports.getOrder = (req, res, next) => {
Order.find({ 'user.userId': req.user._id})
.then(orders =>{
    // console.log(orders,'104')
    res.render('orders',{
        title: 'Your Order',
        path: '/order',
        orders: orders,
        isAuth: req.session.isLoggedIn
    });
})
.catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
   req.user
   .populate('cart.items.productId')
   .execPopulate()
   .then(user => {
    const products = user.cart.items.map(i => {
        console.log(user.cart.items,'121')
        return {quantity: i.quantity, product: i.productId._doc}
    });
    const order = new Order({
        user: {
            name: req.user.fullName,
            userId: req.user
        },
        products: products
    });
    // console.log(order,'131')
    return order.save()
   }).then(result => {
    return req.user.clearCart();
})
   .then(() => {
     res.redirect('/order');
       return mailer.sendMail({
           to: req.user.email,
           from: 'Your Sendgrid verify email',
           subject: 'Order Success',
           html: '<h1>Dear '+ req.user.fullName+' Your Order is Successfully placed....Enjoy!<h1>'
       });
   })
    .catch(err => console.log(err));
};

