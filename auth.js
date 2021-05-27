const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

const Auth = require('../model/authModel');

var mailer =  nodemailer.createTransport(sgTransport({
    auth: {
        api_key: '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'
    }
}));



exports.getLogin = (req, res, next) => {
    res.render('index',{
        title: 'Login', 
        isAuth: req.session.isLoggedIn, 
        path: '/',
    })
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    Auth.findOne({ email: email })
      .then(user => {
        if (!user) {
          return res.redirect('/login');
        }
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user; 
                return req.session.save(err => {
                    console.log(req.session,'29')
                    // console.log(err,'30');
                    res.redirect('/product');
                })
            }
          })
          .catch(err => {
            console.log(err,'37');
            res.redirect('/login');
          });
      })
  };

exports.getSignup = (req, res, next) => {
    res.render('signup',{title: 'Signup',isAuth: req.session.isLoggedIn, path: '/signup'})
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const fullName = req.body.fullName;
    const contect = req.body.contect;
    const password = req.body.password
    Auth.findOne({email: email})
    .then(userMatch => {
        if(userMatch) {
            res.redirect('/signup');
        }
        bcrypt.hash(password, 12)
        .then(hashedPassword => {
        const auth = new Auth ({
            email: email,
            fullName: fullName,
            contect: contect,
            password: hashedPassword
        })
        auth.save()
        .then(result=> {
            // console.log(auth.fullName,'69');
            res.redirect('/');
            return mailer.sendMail({
                to: email,
                from: 'Your Sendgrid verify email',
                subject: 'Signup Success',
                html: '<h1>Dear '+ auth.fullName +' You successfully Signed up</h1>'
            })
        })
    })
    })
    .catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    // console.log(req.session,'69')
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/product');
    })
}

