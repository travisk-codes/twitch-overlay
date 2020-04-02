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
const socket = io(server, { origins: '*:*' })
const twitchClient = TwitchClient.withClientCredentials(clientId, secret)

const webhookConfig = {
	hostName: '1ffba402.ngrok.io',
	port: 8090,
	reverseProxy: { port: 443, ssl: true },
}

async function getWebhookSubscriptions() {
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
	return [streamChangeSubscription, followsSubscription]
}
const subscriptions = getWebhookSubscriptions()

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

socket.on('connection', async socket => {
	console.log('websocket connection established with client')
	const paginatedFollows = twitchClient.helix.users.getFollowsPaginated({
		followedUser: userId,
	})
	follows = await paginatedFollows.getAll()
	socket.emit('follows', follows)

	const stream = await twitchClient.helix.streams.getStreamByUserId(userId)
	if (stream) {
		socket.emit('streamTitleChange', stream.title)
	}

	socket.on('disconnect', async () => {
		try {
			console.log('disconnected')
		} catch (e) {
			console.log(e)
		}
	})
})

app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

server.listen(7781, () => console.log('listening on 7781'))
