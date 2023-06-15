'use strict'

module.exports = function (fastify, options, done) {
  /*
   * WebSocket connection
   */
  fastify.get('/', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message) => {
      try {
        const msgObj = JSON.parse(message)
        fastify.log.info('WebSocket message received: ' + message)
        fastify.log.info('WebSocket message token: ' + msgObj.token)
        fastify.log.info('WebSocket message topic: ' + msgObj.topic)
        if (msgObj.token && fastify.checkAppToken(msgObj.token)) {
          connection.socket.__ghiri_token = msgObj.token
          fastify.log.info('Client validated with app token: ' + msgObj.token)
        } else if (msgObj.topic && fastify.checkAppToken(connection.socket.__ghiri_token)) {
          if (!fastify.subscriptions[msgObj.topic]) {
            fastify.subscriptions[msgObj.topic] = []
          }
          fastify.subscriptions[msgObj.topic].push(connection.socket)
          fastify.log.info('Client subscribed to topic: ' + msgObj.topic)
        } else {
          fastify.log.info('Invalid direct WebSocket message received: ' + message)
          fastify.log.info('Client token: ' + connection.socket.__ghiri_token)
        }
      } catch (err) {
        fastify.log.error(err)
      }
    })

    connection.socket.on('close', (event) => {
      fastify.log.info(`Client left. Reason: ${event}`)

      for (const topic in fastify.subscriptions) {
        const topicIndex = fastify.subscriptions[topic].indexOf(connection.socket)
        if (fastify.subscriptions[topic].includes(connection.socket)) {
          fastify.subscriptions[topic].splice(topicIndex, 1)
        }
      }
    })
  })

  done()
}
