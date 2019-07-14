var User = require("../models/User.js"),
    express = require("express"),
    passport = require("passport"),
    router = express.Router();

router.post('/signup', async (req, res) => {

    User.findOne({ username: req.body.user.username }, async (error, user) => {
        if (error) {
            console.log(error);
            req.flash("error", "Something Went Wrong!");
            res.redirect('/');
        }
        else {
            if (user) {
                req.flash("error", "Username Already Taken");
                res.redirect('/signup');
            } else {
                const user = new User(req.body.user);
                await user.save();
                req.logIn(user, function (err) {
                    if (err) {
                        console.log(err);
                        res.redirect("/login");
                    } else {
                        req.flash("success", "Welcome " + user.username);
                        res.redirect('/');
                    }
                });
            }
        }
    });

});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err)
        if (!user) {
            req.flash("error", info.message);
            return res.redirect('/login')
        }
        req.logIn(user, function (err) {
            if (err) return next(err);
            req.flash("success", "Welcome " + user.username);
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "You have been Logged Out!");
    res.redirect("/");
});

module.exports = router;