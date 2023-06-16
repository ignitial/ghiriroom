const { WebSocket } = require('ws')
const dotenv = require("dotenv")

// load .env file if any
dotenv.config()

SERVER_HOST = process.env.GR_TEST_SERVER_HOST || 'localhost:3000'

console.log('Will run against: %s', SERVER_HOST)

const APP_TOKEN = 'h6EhbYinV2hJ/-jYoeQg9wI8ibR5TQ=0saixl-GjitG72Sbl6cZTT892Ed6R-4Po'
const ADMIN_TOKEN = process.env.GR_ADMIN_TOKEN 

async function init() {
  // create app token
  const res = await (await fetch('http://' + SERVER_HOST + '/token', {
    method: 'POST',
    body: JSON.stringify({ token: APP_TOKEN }),
    headers: { 
      'Content-Type': 'application/json',
      'X-Auth-Token': ADMIN_TOKEN
    }
  })).json()

  console.log(res)

  // check existing tokens
  const tokens = await (await fetch(
    'http://' + SERVER_HOST + '/token', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'X-Auth-Token': ADMIN_TOKEN
      }
    })).json()

  console.log(tokens)

  const topic = 'answer'
  const message = 'This is a test message.'

  // connect to WebSocket server
  const ws = new WebSocket('wss://' + SERVER_HOST + '/ws/')

  ws.on('error', console.error)

  ws.on('open', function open() {
    // get authorization
    ws.send(JSON.stringify({"token": APP_TOKEN}))
    // subscribe to topic
    ws.send(JSON.stringify({"topic": 'answer'}))

    fetch('http://' + SERVER_HOST + '/topic/send/' + topic, {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: { 
        'Content-Type': 'application/json',
        'X-Auth-Token': APP_TOKEN
      }
    })
  })

  ws.on('message', function (data) {
    console.log('received: %s', data)
    data = JSON.parse(data)
    if (data.topic === 'answer' && data.message === message) {
      console.log('received answer: %s. All is good', data.message)
      process.exit()
    }
  })
}

init().catch((err) => {
  console.error(err)
})
