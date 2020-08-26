import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import { TickerItem } from './Tickers'

const MusicTicker = () => {
	const [currentMusic, setCurrentMusic] = useState({
		song: '',
		artist: '',
		album: '',
	})
	const [accessToken, setAccessToken] = useState(null)
	const [refreshToken, setRefreshToken] = useState(null)

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
				'https://api.spotify.com/v1/me/player/currently-playing',
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
		}
	}

	useEffect(() => {
		const access = queryString.parse(window.location.hash).access_token
		const refresh = queryString.parse(window.location.hash).refresh_token
		setAccessToken(access)
		setRefreshToken(refresh)
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

	const fetchNewAccessToken = async () => {
		try {
			const resp = await fetch(
				'https://overlayserver.travisk.info/refresh_token?refresh_token=' +
					refreshToken,
			)
			const json = await resp.json()
			setAccessToken(json.access_token)
		} catch (e) {
			console.log(e.name, e.message)
		}
	}

	useInterval(fetchCurrentMusic, 5000)
	useInterval(fetchNewAccessToken, 1000 * 60 * 5)

	const { song, artist, album } = currentMusic

	const textArray = [
		'🎵 ',
		' Now Playing ',
		' 🎵 ',
		!song
			? 'either YouTube or nothing'
			: ` "${song}" by ${artist} from the album "${album}"`,
	]

	return (
		<TickerItem textArray={textArray} color='white' isFullyColored={false} />
	)
}

export default MusicTicker
