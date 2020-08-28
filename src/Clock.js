import React, { useState, useEffect, useRef } from 'react'
import TickerItem from './TickerItem'

const Clock = () => {
	const [timeTextArray, setTimeTextArray] = useState([])

	function useInterval(callback, delay) {
		const savedCallback = useRef()

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

	function getTimeTextArray() {
		const date = new Date()
		let year = date.getFullYear() % 2000
		let month = (date.getMonth() + 1).toString().padStart(2, '0')
		let day = date.getDate().toString().padStart(2, '0')
		let hour = date.getHours().toString().padStart(2, '0') + ' '
		let minute = date.getMinutes().toString().padStart(2, '0') + ' '
		let second = date.getSeconds().toString().padStart(2, '0')

		// e.g. US NC RA 20 03 09 13 00
		return `EA US NC RA ${year} ${month} ${day} ${hour} ${minute} ${second}`
	}

	useInterval(() => {
		setTimeTextArray(getTimeTextArray())
	}, 1000)

	return (
		<TickerItem emojis={['🕒']} title={timeTextArray} color='lightskyblue' />
	)
}

export default Clock
