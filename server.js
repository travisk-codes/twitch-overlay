const express = require('express')
const http = require('http')
const io = require('socket.io')
const path = require('path')

const TwitchClient = require('twitch').default
const HelixFollow = require('twitch').HelixFollow
const HelixStream = require('twitch').HelixStream
const WebHookListener = require('twitch-webhooks').default

const { userId, clientId, secret } = require('./config')

const app = express()
const server = http.createServer(app)
const socket = io(server)

app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

const twitchClient = TwitchClient.withClientCredentials(clientId, secret)

const webhookConfig = {
	hostName: '084b95ed.ngrok.io',
	port: 8090,
	reverseProxy: { port: 443, ssl: true },
}

async function getWebhookSubscriptions() {
	const listener = await WebHookListener.create(twitchClient, webhookConfig)
	/* 	listener.listen()
	const streamChangeSubscription = await listener.subscribeToStreamChanges(
		userId,
		onStreamChange,
	)
 */ const followsSubscription = await listener.subscribeToFollowsToUser(
		userId,
		onNewFollow,
	)
	return await [, /* streamChangeSubscription */ followsSubscription]
}

async function onStreamChange(stream = HelixStream) {
	try {
		if (stream) {
			console.log('yay stream')
			//console.log(stream.title)
			socket.emit('streamTitleChange', stream.title)
		} else {
			console.log('no stream?')
			const streamTitle = await twitchClient.helix.streams.getStreamByUserId(
				userId,
			).title
			socket.emit('streamTitleChange', streamTitle)
		}
	} catch (e) {
		console.log(e)
	}
}

const onNewFollow = async (follows = HelixFollow) => {
	if (follows) {
		console.log('yay follows')
		console.log(follows)
	} else {
		console.log('no follows :(')
	}
}

const getAllFollows = () => {
	const follows = twitchClient.helix.users.getFollowsPaginated({
		followedUser: userId,
	})
	return follows.getAll()
}

const subscriptions = getWebhookSubscriptions()

socket.on('connection', async socket => {
	console.log('websocket connection established with client')
	const stream = await twitchClient.helix.streams.getStreamByUserId(userId)
	const follows = await getAllFollows()
	socket.emit('streamTitleChange', stream.title)
	socket.emit('follows', follows)

	socket.on('disconnect', async () => {
		try {
			/* 			const streamChangeSubscription = await subscriptions[0]
			streamChangeSubscription.stop()
			const followsSubscription = await subscriptions[1]
			followsSubscription.stop()
 */ console.log(
				'disconnected',
			)
		} catch (e) {
			console.log(e)
		}
	})
})

server.listen(7781, () => console.log('listening on 7781'))

process.on('SIGINT', async () => {
	try {
		/* 		const streamChangeSubscription = await subscriptions
		streamChangeSubscription.stop()
				const followsSubscription = await subscriptions[1]
		followsSubscription.stop()
 */ process.exit(
			0,
		)
	} catch (e) {
		console.log(e)
	}
})
