
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

//ADDED
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//END ADD

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//ADDED
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
//END ADD
app.use(app.router);

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});
//END ADD

// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}

app.locals({
    title: 'BLFconnect'    // default title
});

// Routes
//app.get('/', routes.site.index);

// ADDED
// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        // UNCOMMENT ONE OF THESE LINES. USED TO DISABLE AUTH FOR DEV.
        //res.redirect('/login');
        next();
    }
}

// ADDED THIS BUT IT SHOULD BE IN ROUTES

app.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

app.get('/register', function(req, res) {
  res.render('register', {info: ""});
});

app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });
});

app.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

app.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/ping', function(req, res){
  res.send("pong!", 200);
});

// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose');
// END ADD

app.get('/dashboard', loggedIn, routes.dashboard.list);

//app.get('/users/:id/users', loggedIn, routes.profile.list);
//app.post('users/:id/users', loggedIn, routes.profile.create);
//app.get('/users/:id/profile/:otherid', loggedIn, routes.profile.show);
//app.post('/users/:id/profile/:otherid', loggedIn, routes.profile.edit);
//app.del('/users/:id/profile/:otherid', loggedIn, routes.profile.del);

// What are these first two?
//app.get('/users/:id/users', loggedIn, routes.profile.list);
//app.post('users/:id/users', loggedIn, routes.profile.create);

// Probably need to edit these so user remains logged in(?)
//app.get('/profile/:id', loggedIn, routes.profile.show);
//app.post('/profile/:id', loggedIn, routes.profile.edit);
//app.del('/profile/:id', loggedIn, routes.profile.del);

app.get('/users', loggedIn, routes.users.list);
app.post('/users', loggedIn, routes.users.create);
app.get('/users/:id', loggedIn, routes.users.show);
app.post('/users/:id', loggedIn, routes.users.edit);
app.del('/users/:id', loggedIn, routes.users.del);

app.get('/users/:id/profile/:otherid', loggedIn, routes.users.showProfile);
app.post('/users/:id/profile/green', loggedIn, routes.users.greenProf);
app.post('/users/:id/profile/yellow', loggedIn, routes.users.yellowProf);
app.post('/users/:id/profile/red', loggedIn, routes.users.redProf);

app.post('/users/:id/green', loggedIn, routes.users.green);
app.post('/users/:id/yellow', loggedIn, routes.users.yellow);
app.post('/users/:id/red', loggedIn, routes.users.red);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening at: http://localhost:%d/', app.get('port'));
});
