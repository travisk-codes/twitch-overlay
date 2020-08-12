const express = require('express')
const http = require('http')
const io = require('socket.io')
const path = require('path')
const cors = require('cors')
const querystring = require('querystring')
const cookieParser = require('cookie-parser')
const request = require('request')

const TwitchClient = require('twitch').default
const HelixFollow = require('twitch').HelixFollow
const HelixStream = require('twitch').HelixStream
const HelixSubscription = require('twitch').HelixSubscription
const WebHookListener = require('twitch-webhooks').default

const { userId, clientId, secret } = require('./config')

const app = express()
const server = http.createServer(app)
const socket = io(server, { origins: '*:*', cookie: false })
const twitchClient = TwitchClient.withClientCredentials(clientId, secret)

app.use(express.static(path.join(__dirname, 'build')))
app.use(cors())
app.use(cookieParser())

const webhookConfig = {
	hostName: 'twitchwebhook.travisk.info',
	port: 8090,
	reverseProxy: { port: 443, ssl: true },
}

async function getWebhookSubscriptions() {
	try {
		const listener = await WebHookListener.create(twitchClient, webhookConfig)
		listener.listen()
		const streamChangeSubscription = await listener.subscribeToStreamChanges(
			userId,
			onStreamChange,
		)
		const followsSubscription = await listener.subscribeToFollowsToUser(
			userId,
			onNewFollow,
		)
		const subscriptionsSubscription = await listener.subscribeToSubscriptionEvents(
			userId,
			onNewSubscription,
		)
		return [
			streamChangeSubscription,
			followsSubscription,
			subscriptionsSubscription,
		]
	} catch (e) {
		console.log(e.name, e.message)
	}
}
const webhookSubscriptions = getWebhookSubscriptions()

function onStreamChange(stream = HelixStream) {
	if (stream) {
		console.log('stream title changed')
		socket.emit('streamTitleChange', stream.title)
	}
}

let follows = []
const onNewFollow = (follow = HelixFollow) => {
	console.log(follow)
	if (follow) {
		console.log('new follower')
		follows.unshift(follow)
		socket.emit('follows', follows)
	} else {
		console.log('unfollowed')
		follows.pop()
		socket.emit('follows', follows)
	}
}

let subscriptions = []
const onNewSubscription = (subscription = HelixSubscription) => {
	console.log(subscription)
	if (subscription) {
		console.log('new subscription')
		subscriptions.unshift(subscription)
		socket.emit('subscriptions', subscriptions)
	} else {
		console.log('end subscription')
		subscriptions.pop()
		socket.emit('subscriptions', subscriptions)
	}
}

socket.on('connection', async (clientSocket) => {
	try {
		console.log('webclientSocket connection established with client')
		const paginatedFollows = twitchClient.helix.users.getFollowsPaginated({
			followedUser: userId,
		})
		follows = await paginatedFollows.getAll()
		clientSocket.emit('follows', follows)

		const paginatedSubscriptions = twitchClient.helix.subscriptions.getSubscriptionsPaginated(
			userId,
		)
		subscriptions = await paginatedSubscriptions.getAll()
		console.log('subscriptions: ', subscriptions)
		clientSocket.emit('subscriptions', subscriptions)

		const stream = await twitchClient.helix.streams.getStreamByUserId(userId)
		if (stream) {
			clientSocket.emit('streamTitleChange', stream.title)
		}

		clientSocket.on('disconnect', async () => {
			try {
				console.log('disconnected')
				//subscriptions[0].stop()
				//subscriptions[1].stop()
			} catch (e) {
				console.log(e)
			}
		})
	} catch (e) {
		console.log(e.name, e.message)
	}
})

server.listen(7781, () => console.log('listening on 7781'))
