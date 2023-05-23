require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
const Auth = require('./controllers/auth');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const secretsPerPage = 10; // Number of secrets to display per page

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

// Create user session
app.use(session({
    secret: 'Let us get this coding thing started!',
    resave: false,
    saveUninitialized: false
}));
// Start user session
app.use(passport.initialize());
app.use(passport.session());

// Google login initialization
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    scope: [ 'profile' ],
    state: true
  },
    function (accessToken, refreshToken, profile, cb) {
        // console.log(profile);
        User.findOrCreate({ googleId: profile.id, name: profile.displayName }, (err, user) => {
            if (err) {
                console.error();
            }
            return cb(err, user);
        });
    }
));

// Connect database

mongoose.connect('mongodb://localhost:27017/userDB');

passport.use(User.createStrategy());

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect("/secrets");
});

app.get('/secrets', Auth.isAuthenticated);

app.route('/submit')
    
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render('submit');
        } else {
            res.redirect('/login');
        }
    })
    .post((req, res) => {
        const submittedSecret = req.body.secret;
        const userId = req.user.id;

        User.findById(userId).then(foundUser => {
            foundUser.secrets.push(submittedSecret); // add the new secret to the array
            foundUser.save();
            res.redirect('/secrets');
        }).catch(err => {
            console.log(err);
        });

    });

app.route('/login')

    .get((req, res) => {
        res.render('login');
    })
    .post(Auth.doLogin);

app.get('/logout', Auth.doLogout);

app.route('/register')

    .get((req, res) => {
        res.render('register');
    })
    .post(Auth.doRegister);

app.listen(3000, function() {
  console.log('Server started on port 3000');
});