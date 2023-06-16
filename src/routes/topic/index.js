'use strict'

module.exports = function (fastify, options, done) {
  /* 
  * Send message to topic
  * @param {string} topic - Topic to send message to
  * @param {string} message - Message to send
  */
  fastify.post('/send/:topic', {
    method: 'POST',
    url: '/',
    schema: {
      description: 'Send message to topic',
      tags: ['topic'],
      params: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
        },
        required: ['topic'],
      },
      body: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
      security: [
        {
          xAuthToken: [],
        },
      ],
    },
    handler: async (request, reply) => {
      const topic = request.params.topic
      const message = request.body.message
  
      if (fastify.subscriptions[topic]) {
        fastify.subscriptions[topic].forEach(client => {
          if (client.readyState === 1 /* WebSocket.OPEN */) {
            client.send(JSON.stringify({ topic, message }));
          }
        })
      }
  
      return reply.send({ status: 'ok' })
    },
  })

  done()
}