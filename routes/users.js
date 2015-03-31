// users.js
// Routes to CRUD users.

var User = require('../models/user');

/**
 * GET /users
 */
exports.list = function (req, res, next) {
    User.getAll(function (err, users) {
        if (err) return next(err);
        res.render('users', {
            users: users
        });
    });
};

/**
 * POST /users
 */
exports.create = function (req, res, next) {
    User.create({
        name: req.body['name'],
        major: req.body['major']
    }, function (err, user) {
        if (err) return next(err);
        //res.redirect('/users/' + user.id);
        res.redirect('/users');
    });
};

/**
 * GET /users/:id
 */
exports.show = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        // TODO also fetch and show followers? (not just follow*ing*)
        user.getFollowingAndOthers(function (err, others) {
            if (err) return next(err);
            res.render('user', {
                user: user,
                //following: following,
                others: others
            });
        });
    });
};

/**
 * POST /users/:id
 */
exports.edit = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        user.name = req.body['name'];
        user.save(function (err) {
            if (err) return next(err);
            res.redirect('/users/' + user.id);
        });
    });
};

/**
 * DELETE /users/:id
 */
exports.del = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        user.del(function (err) {
            if (err) return next(err);
            res.redirect('/users');
        });
    });
};

/**
 * POST /users/:id/green
 */
exports.green = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        User.get(req.body.user.id, function (err, other) {
            if (err) return next(err);
            user.green(other, function (err) {
                if (err) return next(err);
                res.redirect('/users/' + user.id);
            });
        });
    });
};

/**
 * POST /users/:id/yellow
 */
exports.yellow = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        User.get(req.body.user.id, function (err, other) {
            if (err) return next(err);
            user.yellow(other, function (err) {
                if (err) return next(err);
                res.redirect('/users/' + user.id);
            });
        });
    });
};

/**
 * POST /users/:id/red
 */
exports.red = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        User.get(req.body.user.id, function (err, other) {
            if (err) return next(err);
            user.red(other, function (err) {
                if (err) return next(err);
                res.redirect('/users/' + user.id);
            });
        });
    });
};


// HERE DOWN IS DEPRECATED 

/**
 * POST /users/:id/unfollow
 */
exports.unfollow = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        User.get(req.body.user.id, function (err, other) {
            if (err) return next(err);
            user.unfollow(other, function (err) {
                if (err) return next(err);
                res.redirect('/users/' + user.id);
            });
        });
    });
};

/**
 * POST /users/:id/yellow // ADDED
 */
exports.updateRelationshipParam = function (req, res, next) {
    User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        User.get(req.body.user.id, function (err, other) {
            if (err) return next(err);
            user.updateRelationshipParam(other, function (err) {
                if (err) return next(err);
                res.redirect('/users/' + user.id);
            });
        });
    });
};
