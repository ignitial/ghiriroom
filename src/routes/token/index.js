'use strict'

/*
* Manages application tokens
*/
module.exports = function (fastify, options, done) {
  // Create token
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
    },
    handler: async (request, reply) => {
      const token = request.body.token

      try {
        const existing = fastify.tokens.findOne({ token })
        if (existing) {
          return reply.status(409).send({ error: 'Token already exists' })
        }
        fastify.tokens.insert({ token })
        return reply.status(201).send({ token })
      } catch (err) {
        fastify.log.error(err)
        return reply.status(500).send(err)
      }
    },
  })

  // Get all tokens
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      try {
        const rows = fastify.tokens.find({})
        return reply.send(rows)
      } catch (err) {
        fastify.log.error(err)
        return reply.status(500).send(err)
      }
    },
  })

  // Delete token
  fastify.route({
    method: 'DELETE',
    url: '/:token',
    handler: async (request, reply) => {
      try {
        const token = request.params.token
        fastify.tokens.remove({ token })
        return reply.send(200)
      } catch (err) {
        fastify.log.error(err)
        return reply.status(500).send(err)
      }
    },
  })

  done()
}