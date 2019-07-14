var express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    mongoose = require("mongoose"),
    cookieParser = require("cookie-parser"),
    bodySanitizer = require("express-sanitizer"),
    User = require("./models/User.js"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    flash = require("connect-flash");


mongoose.connect('mongodb://localhost:27017/moviemela', {
    useNewUrlParser: true,
    useCreateIndex: true
});

passport.use(
    new LocalStrategy(function (username, password, done) {
        User.findOne(
            {
                username: username
            },
            function (err, user) {
                if (err) return done(err);
                if (!user)
                    return done(null, false, {
                        message: "Incorrect Username."
                    });
                user.comparePassword(password, function (err, isMatch) {
                    console.log("comapre", isMatch);
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: "Incorrect Password."
                        });
                    }
                });
            }
        );
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
app.use(bodyParser.json()); // handle json data
app.use(
    bodyParser.urlencoded({
        extended: true
    })
); // handle URL-encoded data
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodySanitizer());
// app.use(methoOverride("_method"));

app.use(cookieParser());
app.use(
    require("express-session")({
        secret: "session secret key",
        resave: false,
        saveUninitialized: false
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
const movie = require("./router/movie"),
    authRoutes = require("./router/authentication");

app.use(movie);
app.use(authRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("Server has started!!!");
});
