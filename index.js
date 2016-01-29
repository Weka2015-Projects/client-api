'use strict'
const koa = require('koa')
const Resource = require('koa-resource-router')
const koaBody = require('koa-better-body')
const knex = require('koa-knex')
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

  // GET /player/:id
  show: function *(next) {
    let id = this.params.players

    let res = yield this.knex.raw('select * from users where id = ?', id)

    if (res.rows.length === 1){
      this.body = { user: res.rows[0] }
    } else {
      this.status = 404
    }
  }
})

app.use(players.middleware())

// Start the application up on port PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} . . .`)
})

// GET game request
// with user/game id/words/other shit
