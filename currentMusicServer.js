var express = require('express') // Express web server framework
var request = require('request') // "Request" library
var cors = require('cors')
var querystring = require('querystring')
var cookieParser = require('cookie-parser')

var client_id = '6b9e8e8b997d45298e0023dc6225522a' // Your client id
var client_secret = '3e1a8dcaeee24c318a79747853cf0a47' // Your secret
var redirect_uri = 'https://travisk.info/current-music/callback' // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
	var text = ''
	var possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

var stateKey = 'spotify_auth_state'

var app = express()

app
	.use(express.static(__dirname + '/public'))
	.use(cors())
	.use(cookieParser())

app.get('/', (req, res) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.redirect('/login')
})

app.get('/login', function(req, res) {
	var state = generateRandomString(16)
	res.cookie(stateKey, state)

	// your application requests authorization
	var scope = 'user-read-playback-state'
	res.header('Access-Control-Allow-Origin', '*')
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state,
			}),
	)
})

app.get('/callback', function(req, res) {
	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null
	var state = req.query.state || null
	var storedState = req.cookies ? req.cookies[stateKey] : null

	if (state === null || state !== storedState) {
		res.redirect(
			'/#' +
				querystring.stringify({
					error: 'state_mismatch',
				}),
		)
	} else {
		res.clearCookie(stateKey)
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code',
			},
			headers: {
				'Access-Control-Allow-Origin': '*',
				Authorization:
					'Basic ' +
					new Buffer(client_id + ':' + client_secret).toString('base64'),
			},
			json: true,
		}

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token
				var options = {
					url: 'https://api.spotify.com/v1/me/player',
					headers: {
						Authorization: 'Bearer ' + access_token,
						'Access-Control-Allow-Origin': '*',
					},
					json: true,
				}

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
					res.json(body)
					/*const { name, album } = body.item
					res.json({
						song: name,
						artist: album.artists[0].name,
						album: album.name,
 					})
					res.redirect(
						'/overlay?' +
							querystring.stringify({
								song: name,
								artist: album.artists[0].name,
								album: album.name,
							}),
					)*/
				})

				// we can also pass the token to the browser to make requests from there
				/* res.redirect(
					'/overlay?' +
						querystring.stringify({
							access_token: access_token,
							refresh_token: refresh_token,
						}),
				) */
			} else {
				res.redirect(
					'/overlay?' +
						querystring.stringify({
							error: 'invalid_token',
						}),
				)
			}
		})
	}
})

app.get('/refresh_token', function(req, res) {
	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			Authorization:
				'Basic ' +
				new Buffer(client_id + ':' + client_secret).toString('base64'),
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		},
		json: true,
	}

	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token
			res.send({
				access_token: access_token,
			})
		}
	})
})

console.log('Listening on 7782')
app.listen(7782)
