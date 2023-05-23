const express = require('express');
const passport = require('passport');
const User = require('../models/User');

const app = express();

module.exports = {
    isAuthenticated: (req, res) => {
        if (req.isAuthenticated()) {
            // View secrets according to the current user
            // const userId = req.user.id;
            // User.findById(userId).then(foundUser => {
            //     const userSecrets = foundUser.secrets;
            // res.render('secrets', { userSecrets: userSecrets });

            // View all secrets by all users
            User.find({ secrets: { $ne: null } }).then(foundUsers => {
                res.render("secrets", { usersWithSecrets: foundUsers });
            }).catch(err => {
                console.log(err);
            });
        } else {
            res.redirect('/login');
        }
    },
    doRegister: (req, res) => {
        const { fullName, username, password } = req.body;
        User.register(
            { name: fullName, username: username },
            password
        ).then(user => {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/register');
        });
    },
    doLogin: (req, res) => {
        const { fullName, username, password } = req.body;
        const user = new User({
            username: username,
            password: password
        });
        req.login(user, (err => {
            if (err) {
                console.error();
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        }));
    },
    doLogout: (req, res) => {
        req.logout(err => {
            if (err) {
                console.error();
            } else {
                res.redirect("/");
            }
        });
    }
};