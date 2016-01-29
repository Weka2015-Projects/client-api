'use strict'
const koa = require('koa')
const Resource = require('koa-resource-router')
const koaBody = require('koa-better-body')
const knex = require('koa-knex')
const cors = require('koa-cors')
const mount = require('koa-mount')
const sqlite3 = require('sqlite3')
const path = require('path')


const PORT = 4000

// Export the app for use in the tests
const app = koa()

// Add the body parser to parse both multipart forms and JSON (for later use)
app.use(koaBody({
  extendTypes: {
    json: [ 'application/x-javascript' ],
  }
}))

// Requests with a body must be type JSON
app.use(function *(next) {
  let noBody = this.method === 'GET'

  if (noBody || this.is('application/json')) {
    yield next
  } else {
    this.status = 400
  }
})

const dbName = `text_invaders_dev`

app.use(knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: '5432',
    database: dbName
  },
  searchPath: 'public'
}))

const players = new Resource('players', {
  // GET /players
  index: function *(next) {
    this.body = yield { players: this.knex('players') }
  },

  // POST /users
 create: function *(next) {
   try {
     const res = yield this.knex('players').returning('*').insert({
       username: this.request.body.fields.name,
       created_at: new Date(),
       updated_at: new Date()
     })

     this.type = 'application/json'
     this.status = 201
     this.set('Location', `/players/${res[0].id}`)
     this.body = { players: res.rows[0] }
   } catch (e) {
     console.log(e)
     this.status = 422
   }
 },

  // GET /player/:id
  show: function *(next) {
    let id = this.params.player

    let res = yield this.knex.raw('select * from players where id = ?', [id])

    if (res.rows.length === 1){
      this.body = { players: res.rows[0] }
    } else {
      this.status = 404
    }
  }
})

const plays = new Resource('plays', {
  // GET /plays
  index: function *(next) {
    this.body = yield { plays: this.knex('plays') }
  },
  // GET /play/:id
  show: function *(next) {
    let id = this.params.play

    let res = yield this.knex.raw('select * from plays where id = ?', [id])

    if (res.rows.length === 1){
      this.body = { plays: res.rows[0] }
    } else {
      this.status = 404
    }
  }
})

const games = new Resource('games', {
  // GET /games
  index: function *(next) {
    this.body = yield { games: this.knex('games') }
  },
  // GET /games/:id
  show: function *(next) {
    let id = this.params.game
    let res = yield this.knex.raw('select * from games where id = ?', [id])

    if (res.rows.length === 1){
      this.body = { games: res.rows[0] }
    } else {
      this.status = 404
    }
  }
})

const options = {
    origin: 'http://localhost:4005',
    methods: ['GET', 'POST', 'PATCH']
}

console.log(options)

app.use(cors(options))

app.use(players.middleware())
app.use(plays.middleware())
app.use(games.middleware())




// Start the application up on port PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} . . .`)
})
