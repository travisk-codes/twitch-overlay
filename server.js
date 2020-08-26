const express = require('express')
const http = require('http')
const io = require('socket.io')
const path = require('path')
const cors = require('cors')
const stringify = require('querystring').stringify
const cookieParser = require('cookie-parser')
const request = require('request')
const redis = require('redis')

const { ApiClient } = require('twitch')
const { StaticAuthProvider } = require('twitch-auth')
const HelixFollow = require('twitch').HelixFollow
const HelixStream = require('twitch').HelixStream
const HelixSubscriptionEvent = require('twitch').HelixSubscriptionEvent
const { LegacyAdapter, WebHookListener } = require('twitch-webhooks')

const { userId, clientId, secret, accessToken } = require('./config')
const { clientSecret } = require('./spotifySecrets')
let twitchAccessToken, twitchRefreshToken

const app = express()
const server = http.createServer(app)
const socket = io(server, { origins: '*:*', cookie: false })

//const authProvider = new StaticAuthProvider(clientId, accessToken)
let twitchClient //const twitchClient = new TwitchClient({ authProvider })

let redisClient = redis.createClient({
	port: 6379,
	host: 'localhost',
	password: process.env.REDIS_PASS,
})

app.use(express.static(path.join(__dirname, 'build')))
app.use(cors())
app.use(cookieParser())

app.get('/twitch-login', function (_, res) {
	const url = 'https://id.twitch.tv/oauth2/authorize?'
	const queryParams = {
		client_id: clientId,
		redirect_uri: 'https://overlayserver.travisk.info/twitch-callback',
		response_type: 'code',
		scope: 'channel:read:subscriptions',
	}

	//res.header('Access-Control-Allow-Origin', '*')
	res.redirect(url + stringify(queryParams))
})

app.get('/twitch-callback', (req, res) => {
	const code = req.query.code
	const authOptions = {
		url: 'https://id.twitch.tv/oauth2/token?',
		form: {
			client_id: clientId,
			client_secret: secret,
			code: code,
			grant_type: 'authorization_code',
			redirect_uri: 'https://overlayserver.travisk.info/twitch-callback',
		},
	}

	request.post(authOptions, (err, response, body) => {
		body = JSON.parse(body)
		twitchAccessToken = body.access_token
		twitchRefreshToken = body.refresh_token
		const authProvider = new StaticAuthProvider(clientId, twitchAccessToken)
		twitchClient = new ApiClient({ authProvider })
		console.log(twitchClient)
		const webhookSubscriptions = getWebhookSubscriptions(twitchClient)
		res.redirect('/#')
	})
})

const webhookConfig = new LegacyAdapter({
	hostName: 'twitchwebhook.travisk.info',
	port: 8090,
	reverseProxy: { port: 443, ssl: true },
})
async function getWebhookSubscriptions(client) {
	try {
		const listener = new WebHookListener(client, webhookConfig)
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
			onSubscriptionEvent,
		)
		return [
			streamChangeSubscription,
			followsSubscription,
			subscriptionsSubscription,
		]
	} catch (e) {
		console.log('getWebhookSubscriptions error', e.name, e.message)
	}
}

async function onStreamChange(stream = HelixStream) {
	if (stream) {
		console.log('stream title changed')
		socket.emit('streamTitleChange', stream.title)
	}
}

let follows = []
const onNewFollow = async (follow = HelixFollow) => {
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
const onSubscriptionEvent = async (subscription = HelixSubscriptionEvent) => {
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
		redisClient.get('doing-now', (err, value) => {
			if (err) throw new Error(err)
			clientSocket.emit('doing-now', value)
		})
		redisClient.get('doing-later', (err, value) => {
			if (err) throw new Error(err)
			clientSocket.emit('doing-later', value)
		})
		redisClient.get('mood', (err, value) => {
			if (err) throw new Error(err)
			clientSocket.emit('mood', value)
		})
		redisClient.get('anxiety', (err, value) => {
			if (err) throw new Error(err)
			clientSocket.emit('anxiety', value)
		})
		redisClient.get('energy-physical', (err, value) => {
			if (err) throw new Error(err)
			clientSocket.emit('energy-physical', value)
		})
		redisClient.get('energy-mental', (err, value) => {
			if (err) throw new Error(err)
			clientSocket.emit('energy-mental', value)
		})

		clientSocket.on('doing-now', (data) =>
			redisClient.set('doing-now', data, (err) => {
				if (err) throw new Error(err)
				clientSocket.broadcast.emit('doing-now', data)
			}),
		)
		clientSocket.on('doing-later', (data) =>
			redisClient.set('doing-later', data, (err) => {
				if (err) throw new Error(err)
				clientSocket.broadcast.emit('doing-later', data)
			}),
		)
		clientSocket.on('mood', (data) =>
			redisClient.set('mood', data, (err) => {
				if (err) throw new Error(err)
				clientSocket.broadcast.emit('mood', data)
			}),
		)
		clientSocket.on('anxiety', (data) =>
			redisClient.set('anxiety', data, (err) => {
				if (err) throw new Error(err)
				clientSocket.broadcast.emit('anxiety', data)
			}),
		)
		clientSocket.on('energy-physical', (data) =>
			redisClient.set('energy-physical', data, (err) => {
				if (err) throw new Error(err)
				clientSocket.broadcast.emit('energy-physical', data)
			}),
		)
		clientSocket.on('energy-mental', (data) =>
			redisClient.set('energy-mental', data, (err) => {
				if (err) throw new Error(err)
				clientSocket.broadcast.emit('energy-mental', data)
			}),
		)

		console.log('webclientSocket connection established with client')
		const paginatedFollows = twitchClient.helix.users.getFollowsPaginated({
			followedUser: userId,
		})
		follows = await paginatedFollows.getAll()
		clientSocket.emit('follows', follows)

		const subscriptions = await twitchClient.helix.subscriptions.getSubscriptionEventsForBroadcaster(
			userId,
		)
		//subscriptions = await paginatedSubscriptions.getAll()
		console.log('subscriptions:', subscriptions)
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
		console.log('socket.on connection: ', e.name, e.message)
	}
})

server.listen(7781, () => console.log('listening on 7781'))
