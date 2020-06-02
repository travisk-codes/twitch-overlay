import React from 'react'
import socketIOClient from 'socket.io-client'

import MusicTicker from './MusicTicker'

import './App.css'

const textEntries = {
	'doing now': 'flash cards for html best practices',
	'then later': "job applications / email / boring stuff",
	announcement1: 'Pull down with your diaphram, not up with your chest',
	announcement2: "If you think you might be dehydrated, you're dehydrated",
	'avg followers': '3.4',
	'current status':
		' Mood: 3/6, Anxiety: 3/6, Energy (Mental): 4/6, Energy (Physical): 4/6',
}

const socket = socketIOClient('https://overlayserver.travisk.info')

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
		let day = date.getDate().toString().padStart(2, '0')
		return [
			'🕒',
			'EA',
			'US ',
			'NC ',
			'RA ',
			year + ' ',
			month + ' ',
			day + ' ',
			date.getHours().toString().padStart(2, '0') + ' ',
			date.getMinutes().toString().padStart(2, '0') + ' ',
			date.getSeconds().toString().padStart(2, '0'),
		]
	}

	useInterval(() => {
		let array = getTimeTextArray()
		if (!array.length) {
			textArray = [
				'🕒',
				'EA',
				'US ',
				'NC ',
				'RA ',
				'00 ',
				'00 ',
				'00 ',
				'00 ',
				'00 ',
				'00',
			]
		}

		setTextArray(array)
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

export const TickerItem = ({
	textArray,
	color,
	isFullyColored,
	className,
	noSpacing,
}) => (
	<div
		className={`ticker__item text ${className}`}
		style={{
			color: isFullyColored ? color : null,
			padding: noSpacing ? '0 10px' : '0 30px',
		}}>
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
	const [input, setInput] = React.useState('')
	const [isEditorOpen, setEditorOpen] = React.useState(false)
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
		let day = date.getDate().toString().padStart(2, '0')
		return [
			'🕒',
			'EA',
			'US ',
			'NC ',
			'RA ',
			year + ' ',
			month + ' ',
			day + ' ',
			date.getHours().toString().padStart(2, '0') + ' ',
			date.getMinutes().toString().padStart(2, '0') + ' ',
			date.getSeconds().toString().padStart(2, '0'),
		]
	}

	useInterval(() => {
		let array = getTimeTextArray()
		setTextArray(array)
	}, 1000)

	React.useEffect(() => {
		console.log('called App useEffect')

		socket.on('follows', (data) => {
			setFollowers(data.map((datum) => datum._data.from_name))
		})
		socket.on('streamTitleChange', (data) => setStreamTitle(data))

		return () => socket.off('')
	}, [followers, streamTitle])

	const topTickerItems = [
		{
			textArray,
			color: 'lightskyblue',
			isFullyColored: true,
		},
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
			textArray: ['📢', 'Announcement:', textEntries['announcement1']],
			color: 'red',
			isFullyColored: false,
		},
		{
			textArray: ['🎉', 'AFFILIATE GET!'],
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
				`${textEntries['avg followers']}/3 average viewers 🧡 Thank You! 🧡`,
			],
			color: 'rgb(255, 150, 150)',
			isFullyColored: true,
		},
		{
			textArray: ['📢', 'Announcement:', textEntries['announcement2']],
			color: 'red',
			isFullyColored: false,
		},
	]

	const bottomTextFollowers = followers
		.filter((text, i) => i < 3)
		.map((follower, i) => [' ♥   ', ' ' + follower])

	const bottomTickerItems = [
		{
			textArray: [' ♥ ', 'Latest Followers', ...bottomTextFollowers],
			color: 'violet',
			isFullyColored: false,
		},
		{
			textArray: MusicTicker(),
			color: 'white',
			isFullyColored: false,
		},
		{
			textArray: [
				'👩🏼 ',
				' Current Status ',
				' 🤔 ',
				textEntries['current status'],
			],
			color: '#ff5090',
			isFullyColored: false,
		},
	]

	const TopTickerItems = () => (
		<>
			{/* 			<TimeTextArray />
			 */}{' '}
			{topTickerItems.map((props, i) => (
				<span key={i}>
					<TickerItem {...props} />
				</span>
			))}
		</>
	)

	const BottomTickerItems = () => (
		<>
			{bottomTickerItems.map((props, i) => (
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
					<TopTickerItems />
					<TopTickerItems />
				</div>
			</div>
			<div className='ticker-wrap-bottom'>
				<div className='ticker-bottom'>
					<BottomTickerItems />
					<BottomTickerItems />
					<BottomTickerItems />
					<BottomTickerItems />
				</div>
			</div>
			{/* 			<div className='bottom-text'>
				{bottomTextItems.map((props, i) => (
					<TickerItem key={i} {...props} />
				))}
			</div>
			<MusicTicker />
			<div className='ticker-wrap-current-status'>
				<div className='ticker-current-status'>
					{[0, 1, 2].map((i) => (
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
 */}{' '}
			<button
				onClick={() => setEditorOpen(!isEditorOpen)}
				className='editor-button'>
				Edit
			</button>
			<div
				style={{ visibility: isEditorOpen ? 'visible' : 'hidden' }}
				className='editor'>
				<form>
					<input
						className='ticker-text-input'
						placeholder='yay'
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
				</form>
			</div>
		</div>
	)
}

export default App
