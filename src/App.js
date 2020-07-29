import React from 'react'
import socketIOClient from 'socket.io-client'

import MusicTicker from './MusicTicker'
import TickerItems from './Tickers'

import './App.css'

const socket = socketIOClient('https://overlayserver.travisk.info')

function App() {
	const [followers, setFollowers] = React.useState([])
	const [streamTitle, setStreamTitle] = React.useState('No stream title')
	const [doingNow, setDoingNow] = React.useState('')
	const [doingLater, setDoingLater] = React.useState('')
	const [currentStatus, setCurrentStatus] = React.useState({
		mood: 3,
		anxiety: 3,
		mental: 3,
		physical: 3,
	})
	const [isEditorOpen, setEditorOpen] = React.useState(true)
	const [textArray, setTextArray] = React.useState([])

	const textEntries = {
		'doing now': doingNow,
		'then later': doingLater,
		announcement1: 'Pull down with your diaphram, not up with your chest',
		announcement2: "If you think you might be dehydrated, you're dehydrated",
		'avg followers': '3.1',
		'current status': `Mood: ${currentStatus.mood}/6, Anxiety: ${currentStatus.anxiety}/6, Energy (Mental): ${currentStatus.mental}/6, Energy (Physical): ${currentStatus.physical}/6 `,
	}

	const topTickerItems = [
		{
			textArray: [''].concat(textArray),
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
		{
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

	const bottomTextFollowers = followers.filter((text, i) => i < 3).join(' ♥ ')

	const bottomTickerItems = [
		{
			textArray: [' 💜 ', 'Latest Followers 💜 ', bottomTextFollowers],
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
		socket.on('follows', (data) => {
			setFollowers(data.map((datum) => datum._data.from_name))
		})
		socket.on('streamTitleChange', (data) => setStreamTitle(data))

		return () => socket.off('')
	}, [followers, streamTitle])

	return (
		<div className='App'>
			<div className='ticker-wrap'>
				<div className='ticker'>
					<TickerItems items={topTickerItems} />
					<TickerItems items={topTickerItems} />
				</div>
			</div>
			<div className='ticker-wrap-bottom'>
				<div className='ticker-bottom'>
					<TickerItems items={bottomTickerItems} />
					<TickerItems items={bottomTickerItems} />
					<TickerItems items={bottomTickerItems} />
					<TickerItems items={bottomTickerItems} />
				</div>
			</div>
			<button
				onClick={() => setEditorOpen(!isEditorOpen)}
				className='editor-button'
			>
				Edit
			</button>
			<div
				style={{
					visibility: isEditorOpen ? 'visible' : 'hidden',
				}}
				className='editor'
			>
				<form>
					<label>
						{'Doing Now: '}
						<input
							className='ticker-text-input'
							value={doingNow}
							onChange={(e) => setDoingNow(e.target.value)}
						/>
					</label>
					<br />
					<label>
						{'Doing Later: '}
						<input
							className='ticker-text-input'
							value={doingLater}
							onChange={(e) => setDoingLater(e.target.value)}
						/>
					</label>
					<br />
					<label>
						{' Mood: '}
						<input
							size='1'
							type='number'
							className='ticker-text-input'
							value={currentStatus.mood}
							onChange={(e) =>
								setCurrentStatus({
									...currentStatus,
									mood: e.target.value,
								})
							}
						/>
					</label>
					<label>
						{' Anxiety: '}
						<input
							size='1'
							type='number'
							className='ticker-text-input'
							value={currentStatus.anxiety}
							onChange={(e) =>
								setCurrentStatus({
									...currentStatus,
									anxiety: e.target.value,
								})
							}
						/>
					</label>
					<label>
						{' Energy (Mental): '}
						<input
							size='1'
							type='number'
							className='ticker-text-input'
							value={currentStatus.mental}
							onChange={(e) =>
								setCurrentStatus({
									...currentStatus,
									mental: e.target.value,
								})
							}
						/>
					</label>
					<label>
						{' Energy (Physical): '}
						<input
							size='1'
							type='number'
							className='ticker-text-input'
							value={currentStatus.physical}
							onChange={(e) =>
								setCurrentStatus({
									...currentStatus,
									physical: e.target.value,
								})
							}
						/>
					</label>

					<div>
						<a href='https://overlayserver.travisk.info/login'>
							{'Log in to Spotify'}
						</a>
					</div>
				</form>
			</div>
		</div>
	)
}

export default App
