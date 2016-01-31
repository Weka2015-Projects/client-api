var passport = require('koa-passport')

var user = { id: 1, username: 'test', password: 'test', timesLoggedIn: 0 }
var user2 = { id: 2, username: 'irene', password: 'nilu', timesLoggedIn: 0 }
var users = [user, user2]


passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  var filteredUsers = users.filter(function(user) {
    return user.id == id
  })
  var theUser = filteredUsers[0]
  done(null, theUser)
})

var LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
  // retrieve user ...
  var filteredUsers = users.filter(function(user) {
    return (user.username === username && user.password === password)
  })
  var theUser = filteredUsers[0]
  if (username === theUser.username && password === theUser.password) {
    theUser.timesLoggedIn++
    done(null, user)
  } else {
    done(null, false)
  }
}))

var FacebookStrategy = require('passport-facebook').Strategy
passport.use(new FacebookStrategy({
    clientID: 'your-client-id',
    clientSecret: 'your-secret',
    callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/facebook/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    done(null, user)
  }
))

var TwitterStrategy = require('passport-twitter').Strategy
passport.use(new TwitterStrategy({
    consumerKey: 'your-consumer-key',
    consumerSecret: 'your-secret',
    callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    done(null, user)
  }
))

var GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy({
    clientId: 'your-client-id',
    clientSecret: 'your-secret',
    callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/google/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    done(null, user)
  }
))
