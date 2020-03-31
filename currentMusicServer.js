const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)

//app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', async (req, res) => {
	res.setHeader('Content-Type', 'application/json')

	let requestQueryParams = {
		client_id: '6b9e8e8b997d45298e0023dc6225522a',
		response_type: 'code',
		redirect_uri: 'http://localhost:3000',
		scope: 'user-read-playback-state',
	}
	let accountAuthRoute = new URL('https://accounts.spotify.com/authorize')
	Object.keys(requestQueryParams).forEach(key => {
		accountAuthRoute.searchParams.append(key, requestQueryParams[key])
	})

	try {
		const response = await fetch(accountAuthRoute)
		res.json(await response)
	} catch (e) {
		console.warn(e.name, e.message)
		res.json(e)
	}
})

server.listen(7782, () => console.log('listening on 7781'))
