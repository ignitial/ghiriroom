'use strict'

const fp = require('fastify-plugin')

const subscriptions = {}

async function clientsPlugin(fastify, options, done) {
  fastify.decorate('subscriptions', subscriptions)

  done()
}

module.exports = fp(clientsPlugin)
