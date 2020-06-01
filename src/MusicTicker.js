import React, { useState, useEffect } from 'react'

const MusicTicker = () => {
	const [currentMusic, setCurrentMusic] = useState({
		song: '',
		artist: '',
		album: '',
	})
	const [accessToken, setAccessToken] = useState(
		'BQDpyrOTnfcICcCfzJiBOu6x81FnPR_Om0UI_aGDWnn8c5Ki4y5N0HpdA0hLge97s9U-8pIMy7nOMIg_dOuDq9sZzF5Sbi7lQbv5s3-AF4qbsjaAIl-7XbIt6tdeHBpO6QF9KZmgbXEdsRQ8FUZo1DnihO46C1g7ZSnhf6crMQ',
	)

	useEffect(() => {
		const fetchAccessAuthorizationFromUser = async () => {}
		const fetchAccessAndRefreshTokens = async (code) => {
			try {
				const response = await fetch(
					'https://travisk.info/current-music/login',
					{
						headers: {
							'Access-Control-Allow-Origin': '*',
						},
					},
				)
				const json = await response.json()
				return json
			} catch (e) {
				console.log('could not fetch access token')
				console.error(e.name + ': ' + e.message)
				return 'fetchAccessToken error'
			}
		}
		const accessResponse = fetchAccessAndRefreshTokens()
		console.log(accessResponse)
		//const tokenResponse = fetchAccessAndRefreshTokens(accessResponse)
	}, [])

	const useInterval = (callback, delay) => {
		const savedCallback = React.useRef()

		// Remember the latest callback.
		useEffect(() => {
			savedCallback.current = callback
		}, [callback])

		// Set up the interval.
		useEffect(() => {
			function tick() {
				savedCallback.current()
			}
			if (delay !== null) {
				let id = setInterval(tick, delay)
				return () => clearInterval(id)
			}
		}, [delay])
	}

	const fetchAccessAndRefreshTokens = async (code) => {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic NmI5ZThlOGI5OTdkNDUyOThlMDAyM2RjNjIyNTUyMmE6M2UxYThkY2FlZWUyNGMzMThhNzk3NDc4NTNjZjBhNDc=',
			},
			body: `grant_type=authorization_code&code=${code}&redirect_uri=http://localhost:3000`,
		}
		try {
			const response = await fetch(
				'https://accounts.spotify.com/api/token',
				requestOptions,
			)
			const json = await response.json()
			return json.access_token
		} catch (e) {
			console.log('could not fetch access token')
			console.error(e.name + ': ' + e.message)
			return 'fetchAccessToken error'
		}
	}

	const fetchCurrentMusic = async () => {
		const requestOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + accessToken,
			},
		}
		try {
			const response = await fetch(
				'https://api.spotify.com/v1/me/player',
				requestOptions,
			)
			const json = await response.json()
			const { name, album } = json.item
			setCurrentMusic({
				song: name,
				artist: album.artists[0].name,
				album: album.name,
			})
		} catch (e) {
			console.warn(e.name + ': ' + e.message)
			setAccessToken(await fetchAccessAndRefreshTokens())
		}
	}

	useInterval(fetchCurrentMusic, 5000)

	const { song, artist, album } = currentMusic

	const textArray = [
		'🎵 ',
		' Now Playing ',
		' 🎵 ',
		!song
			? 'either YouTube or nothing'
			: ` "${song}" by ${artist} from the album "${album}"`,
	]

	return textArray
}

export default MusicTicker
