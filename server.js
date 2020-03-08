const express = require('express')
const path = require('path')
const TwitchWebhook = require('twitch-webhook')

const twitchParams = require('./twitch-webhook-params')

const app = express()
app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', function(req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
app.listen(7781)

const twitchWebhook = new TwitchWebhook(twitchParams)

// set listener for all topics
twitchWebhook.on('*', ({ topic, options, endpoint, event }) => {
	// topic name, for example "streams"
	console.log(topic)
	// topic options, for example "{user_id: 12826}"
	console.log(options)
	// full topic URL, for example
	// "https://api.twitch.tv/helix/streams?user_id=12826"
	console.log(endpoint)
	// topic data, timestamps are automatically converted to Date
	console.log(event)
})

// set listener for topic
twitchWebhook.on('users/follows', ({ event }) => {
	console.log(event)
})

// subscribe to topic
twitchWebhook.subscribe('users/follows', {
	first: 1,
	from_id: 12826, // ID of Twitch Channel ¯\_(ツ)_/¯
})

// renew the subscription when it expires
twitchWebhook.on('unsubscribe', obj => {
	twitchWebhook.subscribe(obj['hub.topic'])
})

// tell Twitch that we no longer listen
// otherwise it will try to send events to a down app
process.on('SIGINT', () => {
	// unsubscribe from all topics
	twitchWebhook.unsubscribe('*')

	// or unsubscribe from each one individually
	twitchWebhook.unsubscribe('users/follows', {
		first: 1,
		to_id: 12826,
	})

	process.exit(0)
})
