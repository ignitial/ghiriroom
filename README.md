# Notificatios for dumbs like me

Simple notification server based on web sockets.
Simple, for dumbs, because engineer should remain simple.
Nothing to sell here. just a need and an answer to the need.
You can deploy the server through Docker, locally or in the cloud.
Putting it behind a reverse proxy like Traefik you should get HTTPS available.

## Configuration

Configuration is exclusively done through environment variables.
Example:

```bash
GR_ADMIN_TOKEN=7DL43deuryjjmAenBvMdzzs2h4I-MNfiFB9i1j8tixGUtYycBlssMrz7I-hUmkST
GR_SERVER_URL=http://localhost:3000
GR_CORS_ALLOW_HOST=*
GR_SHOW_ROUTES=false # set to true to show routes in the console
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000/docs](http://localhost:3000/docs) to view
OpenAPI definition in the browser.

### `npm run start`

For production mode

### `npm run docker:build`

Creates Docker image for furhter usage

### `npm run docker:start`

Starts server as Docker container using Docker compose plugin

### `npm run docker:stop`

Stops server container

### `npm run test`

Executes integrated test running a client script that connects to the server,
creates a token, subscribes to a topic, then sends a message to the topic and
checks that message is received.

## Use Docker Hub image

```bash
docker run --rm --name ghiriroom -p 3000:3000 --env-file ${PWD}/.env -v ${PWD}/data:/usr/src/app/data ignitial/ghiriroom:latest
```

Here we set persistence between different Docker executions thanks to the
volume mapping _-v ${PWD}/data:/usr/src/app/data_. You need _${PWD}/data_
folder to be created.

_${PWD}/.env_ must exist and contain at list the following variable:

```bash
GR_ADMIN_TOKEN=...
```

Default configuration values are set, equivalent to the following:

```bash
GR_SERVER_URL=http://localhost:3000
GR_CORS_ALLOW_HOST=*
```

Obviously, you can set these env variables thanks to the _docker run_'s _-e_
option.

## Connect, subscribe, send messages

When first connects to the WEbSocket server, a client must send back a valid
application token through a WebSocket message of the following format:

```json
{"token": "h6EhbYinV2hJ/-jYoeQg9wI8ibR5TQ=0saixl-GjitG72Sbl6cZTT892Ed6R-4Po"}
```

Subscription to a topic is done thanks to a WebSocket message having the
following format:

```json
{"topic": "my_dumb_topic"}
```

Sending a message to subscribers is done thanks to a call to an HTTP endpoint:

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-Auth-Token: h6EhbYinV2hJ/-jYoeQg9wI8ibR5TQ=0saixl-GjitG72Sbl6cZTT892Ed6R-4Po" \
     -d '{"message": "This is a test message."}' \
     https://localhost:3000/topic/send/answer
```

where the destination topic, here, is _answer_.
See _test/index.js_ for full example.

## Todos

- OpenAPI description and usability
