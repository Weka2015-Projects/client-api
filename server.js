var koa = require('koa')
  , app = koa()

// trust proxy
app.proxy = true

// sessions
var session = require('koa-generic-session')
app.keys = ['your-session-secret']
app.use(session())

// body parser
var bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// authentication
require('./auth')
var passport = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())

// append view renderer
var views = require('koa-render')
app.use(views('./views', {
  map: { html: 'handlebars' },
  cache: false
}))

// public routes
var Router = require('koa-router')

var public = new Router()

public.get('/', function*() {
  this.body = yield this.render('login')
})

public.post('/custom', function*(next) {
  var ctx = this
  yield passport.authenticate('local', function*(err, user, info) {
    console.log(user)
    if (err) throw err
    if (user === false) {
      ctx.status = 401
      ctx.body = { success: false }
    } else {
      yield ctx.login(user)
      ctx.body = { success: true }
    }
  }).call(this, next)
})

// POST /login
public.post('/login',
  passport.authenticate('local', {
    successRedirect: '/app',
    failureRedirect: '/'
  })
)

public.get('/logout', function*(next) {
  this.logout()
  this.redirect('/')
})

public.get('/auth/facebook',
  passport.authenticate('facebook')
)

public.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/app',
    failureRedirect: '/'
  })
)

public.get('/auth/twitter',
  passport.authenticate('twitter')
)

public.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/app',
    failureRedirect: '/'
  })
)

public.get('/auth/google',
  passport.authenticate('google')
)

public.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/app',
    failureRedirect: '/'
  })
)

app.use(public.middleware())

// Require authentication for now
app.use(function*(next) {
  if (this.isAuthenticated()) {
    yield next
  } else {
    this.redirect('/')
  }
})

var secured = new Router()

secured.get('/app', function*() {
  this.body = yield this.render('app', {userCount:this.req.user.timesLoggedIn})
})

secured.get('/secret', function*() {
  this.body = yield this.render('secret')
})


app.use(secured.middleware())

// start server
app.listen(process.env.PORT || 3000)
