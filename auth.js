var dotenv = require('dotenv')
dotenv.load()
var passport = require('koa-passport')

var user = { id: 1, username: 'test' }

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

var localStrategy = require('passport-local').Strategy
passport.use(new localStrategy(function(username, password, done) {
  //retrieve user ...
  if (username === 'test' && password === 'test') {
    done(null, user)
  } else {
    done(null, false)
  }
}))
