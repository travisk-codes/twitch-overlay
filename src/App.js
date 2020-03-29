import React from 'react'
import socketIOClient from 'socket.io-client'

import MusicTicker from './MusicTicker'

import './App.css'

const socket = socketIOClient('http://localhost:7781')

const TimeTextArray = () => {
	const [textArray, setTextArray] = React.useState([])

	function useInterval(callback, delay) {
		const savedCallback = React.useRef()

		// Remember the latest callback.
		React.useEffect(() => {
			savedCallback.current = callback
		}, [callback])

		// Set up the interval.
		React.useEffect(() => {
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
		// US NC RA 20 03 09 13 00
		let year = date.getFullYear() % 2000
		let month = (date.getMonth() + 1).toString().padStart(2, '0')
		let day = date
			.getDate()
			.toString()
			.padStart(2, '0')
		return [
			'🕒',
			'EA',
			'US ',
			'NC ',
			'RA ',
			year + ' ',
			month + ' ',
			day + ' ',
			date
				.getHours()
				.toString()
				.padStart(2, '0') + ' ',
			date
				.getMinutes()
				.toString()
				.padStart(2, '0') + ' ',
			date
				.getSeconds()
				.toString()
				.padStart(2, '0'),
		]
	}

	useInterval(() => {
		setTextArray(getTimeTextArray())
	}, 1000)

	return (
		<TickerItem
			textArray={textArray}
			color='lightskyblue'
			isFullyColored={true}
		/>
	)
}

const Emoji = ({ emoji }) => (
	<span role='img' aria-label='emoji'>
		{emoji}
	</span>
)

export const TickerItem = ({ textArray, color, isFullyColored }) => (
	<div
		className='ticker__item text'
		style={{ color: isFullyColored ? color : null }}>
		<Emoji emoji={textArray[0]} />
		&nbsp;
		<span style={{ color }}>{textArray[1]}</span>
		&nbsp;
		{textArray[2]}
		{textArray[3]}
		{textArray[4]}
		{textArray[5]}
		{textArray[6]}
		{textArray[7]}
		{textArray[8]}
		{textArray[9]}
		{textArray[10]}
	</div>
)

function App() {
	const [followers, setFollowers] = React.useState([])
	const [streamTitle, setStreamTitle] = React.useState('No stream title')

	React.useEffect(() => {
		console.log('called App useEffect')

		socket.on('follows', data => {
			setFollowers(data.map(datum => datum._data.from_name))
		})
		socket.on('streamTitleChange', data => setStreamTitle(data))
	}, [followers, streamTitle])

	const tickerItems = [
		{
			textArray: ['', '', streamTitle],
			color: 'purple',
			isFullyColored: false,
		},
		{
			textArray: ['🕒', 'Doing Now:', 'Getting my overlay online'],
			color: 'lightskyblue',
			isFullyColored: false,
		},
		{
			textArray: ['🕒', 'Then Later:', 'getting overlay online?'],
			color: 'lightskyblue',
			isFullyColored: false,
		},
		/*  {
			textArray: ['🕒', '2100 EST', 'playing CSGO, Trackmania'],
			color: 'rgb(64, 64, 255)',
			isFullyColored: false,
		},
	 */ {
			textArray: ['📢', 'Announcement:', `this-is-fine.gif`],
			color: 'red',
			isFullyColored: false,
		},
		{
			textArray: ['🛣️', 'Road to Affiliate:'],
			color: 'rgb(150, 255, 150)',
			isFullyColored: true,
		},
		{
			textArray: ['🙋🏼‍♀️', followers.length + '/50 followers (!!!)'],
			color: 'rgb(150, 150, 255)',
			isFullyColored: true,
		},
		{
			textArray: ['👀', '1.7/3 average viewers (over half-way there!)'],
			color: 'rgb(255, 150, 150)',
			isFullyColored: true,
		},
	]

	const bottomTextFollowers = followers.map((follower, i) => ({
		textArray: ['♥ ', ' ' + follower],
		color: `hsl(${i * 25}, 100%, 75%)`,
		isFullyColored: false,
	}))

	const bottomTextItems = [
		{
			textArray: ['💕', 'Thank you so much for following!'],
			color: 'white',
			isFullyColored: false,
		},
		...bottomTextFollowers,
	]

	const TickerItems = () => (
		<>
			<TimeTextArray />
			{tickerItems.map((props, i) => (
				<TickerItem key={i} {...props} />
			))}
		</>
	)

	return (
		<div className='App'>
			<div className='ticker-wrap'>
				<div className='ticker'>
					<TickerItems />
					<TickerItems />
					<TickerItems />
					<TickerItems />
					<TickerItems />
					<TickerItems />
					<TickerItems />
					<TickerItems />
					<TickerItems />
					<TickerItems />
				</div>
			</div>
			<div className='drop-shadow' id='screen-box' />
			<div className='drop-shadow' id='camera-box' />{' '}
			{/* 			<div className='drop-shadow' id='terminal' />
			<div className='drop-shadow' id='vscode' />
			<div className='drop-shadow' id='browser' />
 */}{' '}
			<div className='bottom-text'>
				{bottomTextItems.map((props, i) => (
					<TickerItem key={i} {...props} />
				))}
			</div>
			<MusicTicker />
		</div>
	)
}

export default App
