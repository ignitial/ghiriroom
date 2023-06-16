'use strict'

const path = require('path')

const dotenv = require("dotenv")
const fastifyAutoLoad = require('@fastify/autoload')
const info = require('../package.json')

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
  fastify.register(require('@fastify/swagger'), {
    openapi: {
      info: {
        title: 'Ghiriroom',
        description: 'API documentation for Ghiriroom',
        version: info.version,
      },
      tags: [
        { name: 'token', description: 'Token administration related end-points' },
        { name: 'topic', description: 'Topic and messages related end-points' },
        { name: 'websocket', description: 'Websocket management' }
      ],
      servers: [{
        url: process.env.GR_SERVER_URL || 'http://localhost:3000'
      }],
      components: {
        securitySchemes: {
          xAuthToken: {
            type: 'apiKey',
            name: 'X-Auth-Token',
            in: 'header',
          },
        }
      }
    },
  })
  fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    exposeRoute: true,
  })

  /*
  * admin token check
  */
  fastify.addHook('preValidation', async (request, reply) => {
    const token = request.headers['x-auth-token']

    if (request.routerPath.match('/topic/send')) {
      try {
        if (!fastify.checkAppToken(token)) {
          return reply.status(403).send('Application token does not match')
        }
      } catch (err) {
        reply.status(500).send({ error: 'An error occurred while validating admin token' });
      }
    } else if (request.routerPath.match('/token')) {
      try {
        if (token !== process.env.GR_ADMIN_TOKEN) {
          reply.status(401).send({ error: 'Invalid admin token' })
        }
      } catch (err) {
        reply.status(500).send({ error: 'An error occurred while validating admin token' });
      }
    }
  })
  
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
