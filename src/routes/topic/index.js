'use strict'

module.exports = function (fastify, options, done) {
  /* 
  * Send message to topic
  * @param {string} topic - Topic to send message to
  * @param {string} message - Message to send
  */
  fastify.post('/send/:topic', async (request, reply) => {
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
  })

  done()
}