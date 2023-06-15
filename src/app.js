'use strict'

const path = require('path')

const dotenv = require("dotenv")
const fastifyAutoLoad = require('@fastify/autoload')

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {}

module.exports = async function (fastify, opts) {
  // load .env file if any
  dotenv.config()
  
  if (process.env.GR_SHOW_ROUTES && process.env.GR_SHOW_ROUTES === 'true') {
    fastify.log.info('Showing routes <' + process.env.GR_SHOW_ROUTES + '>')
    fastify.addHook('onRoute', routeOptions => {
      if (routeOptions.routePath !== '' && routeOptions.routePath !== '/*') {
        fastify.log.info(routeOptions.method + ' - ' + routeOptions.url)
      }
    })
  }

  fastify.register(require('@fastify/cors'), {
    origin: [ process.env.GR_CORS_ALLOW_HOST || '*'],
    methods: ['GET', 'POST', 'DELETE']
  })
  fastify.register(require('@fastify/websocket'))
  fastify.register(require('@fastify/swagger'), {})
  fastify.register(require('@fastify/swagger-ui'), {
    openapi: {
      info: {
        title: 'Ghiriroom',
        description: 'API documentation for Ghiriroom',
        version: '1.0.0',
      },
      servers: [{
        url: process.env.GR_SERVER_URL || 'http://localhost:3000'
      }],
    },
    exposeRoute: true,
    routePrefix: '/docs'
  })

  /*
  * admin token check
  */
  fastify.addHook('preValidation', async (request, reply) => {
    const token = request.headers.authorization
    if (
      request.routerPath.match('/topic//subscribe') || request.routerPath.match('/topic/send')
    ) {
      try {
        if (!fastify.checkAppToken(token)) {
          return reply.status(403).send('Application token does not match')
        }
      } catch (err) {
        reply.status(500).send({ error: 'An error occurred while validating admin token' });
      }
    } else if (request.routerPath.match('/token') && request.routerMethod !== 'GET') {
      try {
        if (token !== process.env.GR_ADMIN_TOKEN) {
          fastify.log.info(request.headers)
          fastify.log.info(token + ' ? ' + process.env.GR_ADMIN_TOKEN)
          reply.status(401).send({ error: 'Invalid admin token' })
        }
      } catch (err) {
        reply.status(500).send({ error: 'An error occurred while validating admin token' });
      }
    }
  });
  
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(fastifyAutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(fastifyAutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
