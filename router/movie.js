const express = require("express"),
    router = express.Router(),
    User = require("../models/User.js"),
    request = require("request");

router.get("/", (req, res) => {
    request("https://api.themoviedb.org/3/trending/movie/day?api_key=621354191214df0e224e791728b4fdad", (error, response, body) => {
        if (error) {
            return console.log(error);
        } else {
            var data = JSON.parse(body);
            res.render("home", { data: data });

        }
    });
});

router.get("/login", async (req, res) => {
    res.render("login");
})

router.get("/signup", async (req, res) => {
    res.render("signup");
})

router.get("/search", (req, res) => {
    const movie = req.query.name;
    request("https://api.themoviedb.org/3/search/movie?api_key=621354191214df0e224e791728b4fdad&query=" + movie + "&language=en-US&page=1&include_adult=false", (error, response, body) => {
        if (error) {
            return console.log(error);
        }
        else {
            const data = JSON.parse(body);
            res.render("home", { data: data });
        }
    });
});

router.get("/display/:id", (req, res) => {
    const id = req.params.id;
    request("https://api.themoviedb.org/3/movie/" + id + "?api_key=621354191214df0e224e791728b4fdad&language=en-US&append_to_response=videos", async (error, response, body) => {
        if (error) {
            return console.log(error);
        } else {
            const data = JSON.parse(body);
            var crew;
            var isdisplay = 0;
            if (req.isAuthenticated()) {
                const isexist = await User.findOne({ 'fav.id': req.params.id })
                if (isexist) isdisplay = 1;
            }
            console.log(isdisplay);
            request("https://api.themoviedb.org/3/movie/" + id + "/credits?api_key=621354191214df0e224e791728b4fdad", (error, respon) => {
                const crew = JSON.parse(respon.body);
                res.render("displaymovie", { data: data, cast: crew.cast, isdisplay: isdisplay });
            });
        }
    });
});

router.delete("/myfavourite/:id/tag/:tag",isLoggedin, async (req, res) => {
    User.findById(req.params.id,async (error, user) => {
        user.fav = user.fav.filter((movie) => {
            return movie.id != req.params.tag
        })
        await user.save();
        res.json(user);
    });

});


router.put("/favourite/:id/name/:name/poster/:poster/tag/:tag",isLoggedin, async (req, res) => {
    const favv = {
        name: req.params.name,
        poster: "https://image.tmdb.org/t/p/w300_and_h450_bestv2/" + req.params.poster,
        id: req.params.tag
    }
    User.findById(req.params.id, async (error, user) => {
        var len = user.fav.length;
        user.fav = user.fav.filter((movie) => {
            return movie.id != req.params.tag
        })
        if (len == user.fav.length) {
            user.fav.push(favv);
        }
        await user.save();
        res.json(user);
    });

});

router.get('/myfavourite/:id',isLoggedin, async (req, res) => {
    User.findById(req.params.id, async (error, user) => {
        if (error) {
            return console.log(error);
        }
        else res.render('favourite', { data: user })
    })
});

router.get("/person/:id", (req, res) => {
    const id = req.params.id;
    request("https://api.themoviedb.org/3/person/" + id + "?api_key=621354191214df0e224e791728b4fdad&language=en-US&append_to_response=external_ids", (error, response, body) => {
        if (error) {
            return console.log(error);
        } else {
            const data = JSON.parse(body);
            request("https://api.themoviedb.org/3/discover/movie?api_key=621354191214df0e224e791728b4fdad&language=en-US&sort_by=popularity.desc&include_adult=false&page=1&with_cast=" + id, (error, respon) => {
                const known = JSON.parse(respon.body);
                res.render("actor", { data: data, known: known.results });
            });
        }
    });
});

function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error", "You are not Logged in");
        res.redirect("/login");
    }
}

module.exports = router;