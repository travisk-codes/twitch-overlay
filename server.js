const express = require('express')
const http = require('http')
const io = require('socket.io')
const path = require('path')

const TwitchClient = require('twitch').default
const HelixFollow = require('twitch').HelixFollow
const HelixStream = require('twitch').HelixStream
const WebHookListener = require('twitch-webhooks').default

const spotifyWebApi = require('spotify-web-api-node')

const { userId, clientId, secret } = require('./config')
const {
	spotifyClientId,
	clientSecret,
	redirectURI,
} = require('./spotifySecrets')

const app = express()
const server = http.createServer(app)
const socket = io(server, { origins: '*:*' })
const twitchClient = TwitchClient.withClientCredentials(clientId, secret)

const spotifyApi = new spotifyWebApi({
	clientId: spotifyClientId,
	clientSecret,
	redirectUri: redirectURI,
})

spotifyApi
	.authorizationCodeGrant('PUT_A_CODE_HERE')
	.then((data) => {
		spotifyApi.setAccessToken(data.body['access_token'])
		spotifyApi.setRefreshToken(data.body['refresh_token'])
		return spotifyApi.getMe()
	})
	.then((data) => console.log(data))
	.catch((err) => console.error('uh oh error', err))

const webhookConfig = {
	hostName: 'twitchwebhook.travisk.info',
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

socket.on('connection', async (clientSocket) => {
	console.log('webclientSocket connection established with client')
	const paginatedFollows = twitchClient.helix.users.getFollowsPaginated({
		followedUser: userId,
	})
	follows = await paginatedFollows.getAll()
	clientSocket.emit('follows', follows)

	const stream = await twitchClient.helix.streams.getStreamByUserId(userId)
	if (stream) {
		clientSocket.emit('streamTitleChange', stream.title)
	}

	clientSocket.on('disconnect', async () => {
		try {
			console.log('disconnected')
			subscriptions[0].stop()
			subscriptions[1].stop()
		} catch (e) {
			console.log(e)
		}
	})
})

app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.get('/callback')

server.listen(7781, () => console.log('listening on 7781'))
