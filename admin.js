const Product = require('../model/productModel');
const fs = require('fs');
const path = require('path');

exports.getAddProduct = (req, res, next ) => {
    res. render('admin/addProduct',{title: 'Add Product', isAuth: req.session.isLoggedIn , path: '/addProduct'})
}

exports.getProduct = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(product => {
        res.render('admin/products',{
            title: 'Admin Product',
            path: '/admin/product',
            products: product,
            isAuth : req.session.isLoggedIn,
            message: req.flash('message')
        })
    })
    .catch(err => console.log(err));
}

exports.postAddProduct = (req, res, next) => {
    const productTitle = req.body.productTitle;
    const price = req.body.price;
    const productDesc = req.body.productDesc;
    const productImage = req.file;
    if(!productImage){
        return res.redirect('/addProduct');
    }
    const image = productImage.path;

    const product = new Product({
        productTitle: productTitle,
        price: price,
        productDesc: productDesc,
        image: image,
        userId: req.session.user._id
    });
    product.save()
    .then(result => {
        console.log('Product Saved');
        req.flash('message','Successfully Add Book')
        res.redirect('/admin/product')
    })
    .catch(err => console.log(err));

};

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    // console.log(prodId,'50');
    Product.findById(prodId)
    .then(product => {
        // console.log(product,'53');
        res.render('admin/edit-product',{
            title: 'Edit Product',
            path: '/admin/edit-product',
            product: product,
            isAuth: req.session.isLoggedIn
        })
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    // console.log(prodId,'66');
    const updateTitle = req.body.productTitle;
    const updatePrice = req.body.price;
    const updateDesc = req.body.productDesc
    const updateImage = req.file;

    Product.findById(prodId)
    .then(product => {
        console.log(product,'74');
        product.productTitle = updateTitle;
        product.price = updatePrice;
        product.productDesc = updateDesc;
        if(updateImage) {
            product.image = updateImage.path;
        }
        return product.save();
    })  
    .then(result => {
        console.log('Product Update Success');
        res.redirect('/admin/product');
    })
    .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById({_id : prodId, userId: req.user._id})
    .then(deleteImage => {
        clearImage(deleteImage.image)
        return Product.findByIdAndRemove(prodId);
    })
    .then(result=> {        
        console.log('Product Delete Success');
        res.redirect('/admin/product');
    })
    .catch(err => console.log(err));
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}