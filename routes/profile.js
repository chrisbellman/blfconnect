// profile.js
// Routes to CRUD profile.

var User = require('../models/user');

/**
 * GET /profile
 */
exports.list = function (req, res, next) {
    User.getAll(function (err, profile) {
        if (err) return next(err);
        res.render('profile', {
            profile: profile
        });
    });
};

/**
 * POST /profile
 */
exports.create = function (req, res, next) {
    User.create({
        name: req.body['name'],
        major: req.body['major']
    }, function (err, user) {
        if (err) return next(err);
        //res.redirect('/profile/' + user.id);
        res.redirect('/profile');
    });
};

/**
 * GET /profile/:id
 */
exports.show = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        // TODO also fetch and show followers? (not just follow*ing*)
        user.getFollowingAndOthers(function (err, following, others) {
            if (err) return next(err);
            res.render('user', {
                user: user,
                //following: following,
                //others: others
            });
        });
    });
};

/**
 * POST /profile/:id
 */
exports.edit = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        user.name = req.body['name'];
        user.save(function (err) {
            if (err) return next(err);
            res.redirect('/profile/' + user.id);
        });
    });
};

/**
 * DELETE /profile/:id
 */
exports.del = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        user.del(function (err) {
            if (err) return next(err);
            res.redirect('/profile');
        });
    });
};

/**
 * POST /profile/:id/follow
 */
exports.follow = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        User.get(req.body.user.id, function (err, other) {
            if (err) return next(err);
            user.follow(other, function (err) {
                if (err) return next(err);
                res.redirect('/profile/' + user.id);
            });
        });
    });
};

/**
 * POST /profile/:id/unfollow
 */
exports.unfollow = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        User.get(req.body.user.id, function (err, other) {
            if (err) return next(err);
            user.unfollow(other, function (err) {
                if (err) return next(err);
                res.redirect('/profile/' + user.id);
            });
        });
    });
};
