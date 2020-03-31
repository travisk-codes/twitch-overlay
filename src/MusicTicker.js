import React, { useState, useEffect } from 'react'

import { TickerItem } from './App'

/**
 * - get a token and time until it expires
 * - get a new token before that time elapses
 * - with token, fetch current music every X seconds
 *   ( fetch current music after given song duration )
 *
 * - request current song
 * - schedule request for duration_ms - progress_ms
 * - if 401, fetchAccessToken
 * - then GOTO 10
 */

const MusicTicker = () => {
	console.log('called MusicTicker')
	const [currentMusic, setCurrentMusic] = useState({
		song: '',
		artist: '',
		album: '',
	})
	const [accessToken, setAccessToken] = useState(
		'BQBi2auvbHVAUHcJZ3-N7wITOBGqo9u82VnWXcUq-QI64M2EMjC0uKf8nJIRFLdrkYZVR_GiKStva9uvK8kXUKoIy45iyB8p6uHXsDhS78u1VSJZyAv7JDfLfE5TdWw2HATuaui-P7qBmPBlsUOLH-zpjdIE',
	)

	useEffect(() => {
		const fetchAccessAuthorizationFromUser = async () => {}
		const fetchAccessAndRefreshTokens = async code => {
			try {
				const response = await fetch('https://travisk.info/current-music')
				const json = await response.json()
				console.log(json)
			} catch (e) {
				console.log('could not fetch access token')
				console.error(e.name + ': ' + e.message)
				return 'fetchAccessToken error'
			}
		}
		const accessResponse = fetchAccessAuthorizationFromUser()
		console.log(accessResponse)
		//const tokenResponse = fetchAccessAndRefreshTokens(accessResponse)
	}, [])

	const useInterval = (callback, delay) => {
		console.log('called useInterval')
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

	const fetchAccessAndRefreshTokens = async code => {
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
		console.log('called fetchCurrentMusic')
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
		!song ? 'Nothing' : ` "${song}" by ${artist} from the album "${album}"`,
	]

	return (
		<div className='ticker-wrap-music'>
			<div className='ticker-music'>
				<TickerItem textArray={textArray} />
				<TickerItem textArray={textArray} />
				<TickerItem textArray={textArray} />
			</div>
		</div>
	)
}

export default MusicTicker
