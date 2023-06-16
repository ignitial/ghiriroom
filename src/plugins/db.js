'use strict'

const path = require('path')
const loki = require('lokijs')
const fp = require('fastify-plugin')

function dbPlugin(fastify, options, done) {
  const db = new loki(path.join(__dirname, '../../data', 'database.db'), {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true, 
    autosaveInterval: 4000
  })

  const collections = {
    tokens: null
  }

  const checkAppToken = (token) => {
    try {
      const foundToken = collections.tokens.findOne({ token: token })
      return foundToken
    } catch (err) {
      return null
    }
  }
  
  // implement the autoloadback referenced in loki constructor
  function databaseInitialize() {
    collections.tokens = db.getCollection('tokens')

    if (collections.tokens === null) {
      collections.tokens = db.addCollection('tokens')
    }

    fastify.decorate('db', db)
    fastify.decorate('tokens', collections.tokens)
    fastify.decorate('checkAppToken', checkAppToken)

    done()
  }
}

module.exports = fp(dbPlugin)