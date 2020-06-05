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
const twitchClient = TwitchClient.withClientCredentials(
	clientId,
	secret,
)

app.use(express.static(path.join(__dirname, 'build')))
app.use(cors())
app.use(cookieParser())

const webhookConfig = {
	hostName: 'twitchwebhook.travisk.info',
	port: 8090,
	reverseProxy: { port: 443, ssl: true },
}

async function getWebhookSubscriptions() {
	const listener = await WebHookListener.create(
		twitchClient,
		webhookConfig,
	)
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
	console.log(
		'webclientSocket connection established with client',
	)
	const paginatedFollows = twitchClient.helix.users.getFollowsPaginated(
		{
			followedUser: userId,
		},
	)
	follows = await paginatedFollows.getAll()
	clientSocket.emit('follows', follows)

	const stream = await twitchClient.helix.streams.getStreamByUserId(
		userId,
	)
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

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.get('/login', (req, res) => {
	let state = 'random string'
	res.cookie('spotify_auth_state', state)
	console.log(redirectURI)
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: spotifyClientId,
				scope: 'user-read-currently-playing',
				redirect_uri: redirectURI,
				state: state,
			}),
	)
})

app.get('/callback', (req, res) => {
	const code = req.query.code || null
	const state = req.query.state || null
	const storedState = req.cookies
		? req.cookies['spotify_auth_state']
		: null

	if (state === null || state !== storedState) {
		res.redirect(
			'/#' +
				querystring.stringify({ error: 'state_mismatch' }),
		)
	} else {
		console.log(redirectURI)
		res.clearCookie('spotify_auth_state')
		const authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code,
				redirect_uri: redirectURI,
				grant_type: 'authorization_code',
			},
			headers: {
				Authorization:
					'Basic ' +
					new Buffer(
						spotifyClientId + ':' + clientSecret,
					).toString('base64'),
			},
			json: true,
		}

		request.post(authOptions, (err, response, body) => {
			if (!err && response.statusCode === 200) {
				const access_token = body.access_token
				const refresh_token = body.refresh_token
				const options = {
					url:
						'https://api.spotify.com/v1/me/player/currently-playing',
					headers: {
						Authorization: 'Bearer ' + access_token,
					},
					json: true,
				}

				request.get(options, (error, response, body) => {
					console.log(body)
				})

				res.redirect(
					'/#' +
						querystring.stringify({
							access_token,
							refresh_token,
						}),
				)
			} else {
				res.redirect(
					'/#' +
						querystring.stringify({
							error: 'invalid_token',
						}),
				)
			}
		})
	}
})

server.listen(7781, () => console.log('listening on 7781'))
