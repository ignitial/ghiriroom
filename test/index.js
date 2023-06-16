const { WebSocket } = require('ws')
const dotenv = require("dotenv")

// load .env file if any
dotenv.config()

const APP_TOKEN = 'h6EhbYinV2hJ/-jYoeQg9wI8ibR5TQ=0saixl-GjitG72Sbl6cZTT892Ed6R-4Po'
const ADMIN_TOKEN= process.env.GR_ADMIN_TOKEN 

async function init() {
  // create app token
  const res = await (await fetch('http://localhost:3000/token', {
    method: 'POST',
    body: JSON.stringify({ token: APP_TOKEN }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': ADMIN_TOKEN
    }
  })).json()

  console.log(res)

  // check existing tokens
  const tokens = await (await fetch(
    'http://localhost:3000/token', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': ADMIN_TOKEN
      }
    })).json()

  console.log(tokens)

  const topic = 'answer'
  const message = 'This is a test message.'

  // connect to WebSocket server
  const ws = new WebSocket('ws://localhost:3000/ws/')

  ws.on('error', console.error)

  ws.on('open', function open() {
    // get authorization
    ws.send(JSON.stringify({"token": APP_TOKEN}))
    // subscribe to topic
    ws.send(JSON.stringify({"topic": 'answer'}))

    fetch('http://localhost:3000/topic/send/' + topic, {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': APP_TOKEN
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
