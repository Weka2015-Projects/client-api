var koa = require('koa')
  , app = koa()

// trust proxy
app.proxy = true

//sessions
var session = require('koa-generic-session')
app.keys = ['your-session-secret']
app.use(session())

//var sessionCounter = {}

//body parser
var bodyParser = require('koa-bodyparser')
app.use(bodyParses())

//authentication
require('./auth')
var passort = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())

//append view renderer
var views = require('koa-render')
app.use(views('./views', {
  map: { html: 'handlebars' },
  cache: false
}))

//public routes
var Router = require('koa-router')

var public = new Router()

public.get('/', function*() {
  this.body = yield this.render('login')
})

public.post('/custom', function*(next) {
  var context = this
  yield passport.authenticate('local', function*(err, user, info) {
    if(err) throw err
    if (user === false) {
      context.status = 401
      context.body = { success: false }
    } else {
      yield context.login(user)
      context.body = { success: true }
    }
  }).call(this, next)
})

//POST /login
public.post('/login',
  passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/'
  })
)

public.get('/logout', function*(next) {
  this.logout()
  this.redirect('/')
})

app.use(public.middleware())

//Require authentication for now
app.use(function*(next) {
  if (this.isAuthenticated()) {
    yield next
  } else {
    this.redirect('/')
  }
})

var secured = new Router()

secured.get('/secret', function*() {
  const userId = this.session.passport.user
  sessionCounter[userId] = sessionCounter[userId] || 0
  sessionCounter[userId]++

  this.session.counter = this.session.counter || 0
  this.session.counter++
  this.body = yield this.render('secret')
})

app.use(secured.middleware())

app.listen(process.env.PORT || 3000)
