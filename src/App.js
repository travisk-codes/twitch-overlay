import React from 'react'
import socketIOClient from 'socket.io-client'

import MusicTicker from './MusicTicker'

import './App.css'

const textEntries = {
	'doing now': 'trying to get spotify auth flow working',
	'then later': 'maybe short article on ticker text solution?',
	announcement: 'this_is_fine.gif',
	'avg followers': '1.9',
	'current status': ' coffee has me going yet!',
}

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

export const TickerItem = ({ textArray, color, isFullyColored, className }) => (
	<div
		className={`ticker__item text ${className}`}
		style={{ color: isFullyColored ? color : null }}>
		<Emoji emoji={textArray[0]} />
		&nbsp;
		<span style={{ color }}>{textArray[1]}</span>
		&nbsp;
		{textArray.map((_, i) =>
			i > 1 ? <span key={i}>{textArray[i]}&nbsp;</span> : null,
		)}
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
			textArray: ['🕒', 'Doing Now:', textEntries['doing now']],
			color: 'lightskyblue',
			isFullyColored: false,
		},
		{
			textArray: ['🕒', 'Then Later:', textEntries['then later']],
			color: 'lightskyblue',
			isFullyColored: false,
		},
		/*  {
			textArray: ['🕒', '2100 EST', 'playing CSGO, Trackmania'],
			color: 'rgb(64, 64, 255)',
			isFullyColored: false,
		},
	 */ {
			textArray: ['📢', 'Announcement:', textEntries['announcement']],
			color: 'red',
			isFullyColored: false,
		},
		{
			textArray: ['🛣️', 'Road to Affiliate:'],
			color: 'rgb(150, 255, 150)',
			isFullyColored: true,
		},
		{
			textArray: ['🙋🏼‍♀️', followers.length + '/50 followers 💜 Thank You! 💜'],
			color: 'rgb(150, 150, 255)',
			isFullyColored: true,
		},
		{
			textArray: [
				'👀',
				`${textEntries['avg followers']}/3 average viewers (over half-way there!)`,
			],
			color: 'rgb(255, 150, 150)',
			isFullyColored: true,
		},
	]

	const bottomTextFollowers = followers.map((follower, i) => ({
		textArray: ['♥ ', ' ' + follower],
		color: `hsl(${i * 40}, 100%, 75%)`,
		isFullyColored: false,
	}))

	const bottomTextItems = [
		{
			textArray: ['♥ ', 'Newest Followers'],
			color: 'white',
			isFullyColored: false,
		},
		...bottomTextFollowers,
	]

	const TickerItems = () => (
		<>
			<TimeTextArray />
			{tickerItems.map((props, i) => (
				<span key={i}>
					<TickerItem {...props} />
				</span>
			))}
		</>
	)

	return (
		<div className='App'>
			<div className='ticker-wrap'>
				<div className='ticker'>
					<TickerItems />
					<TickerItems />
				</div>
			</div>
			<div className='drop-shadow' id='camera-box' />
			{/* 			<div className='drop-shadow' id='screen-box' />
			<div className='drop-shadow' id='terminal' />
			<div className='drop-shadow' id='vscode' />
			<div className='drop-shadow' id='browser' />
 */}{' '}
			<div className='bottom-text'>
				{bottomTextItems.map((props, i) => (
					<TickerItem key={i} {...props} />
				))}
			</div>
			<MusicTicker />
			<div className='ticker-wrap-current-status'>
				<div className='ticker-current-status'>
					{[0, 1].map(i => (
						<TickerItem
							key={i}
							textArray={[
								'👩🏼 ',
								' Current Status ',
								' 🤔 ',
								textEntries['current status'],
							]}
							color='#ff5090'
							isFullyColored={false}
							className='current-status'
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export default App
