import React from 'react'
import socketIOClient from 'socket.io-client'

import MusicTicker from './MusicTicker'

import './App.css'

const textEntries = {
	'doing now': 'fighting for our freedom to tell others how to live',
	'then later': 'probably more of the same',
	announcement: 'this_is_fine.gif',
	'avg followers': '1.93',
	'current status': ' are you feeling it now, mr krabs?',
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

	React.useEffect(() => {
		console.log('called App useEffect')

		socket.on('follows', (data) => {
			setFollowers(data.map((datum) => datum._data.from_name))
		})
		socket.on('streamTitleChange', (data) => setStreamTitle(data))
	}, [followers, streamTitle])

	const topTickerItems = [
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

	const bottomTextFollowers = followers
		.filter((text, i) => i < 3)
		.map((follower, i) => [' ♥   ', ' ' + follower])

	const bottomTickerItems = [
		{
			textArray: [' ♥ ', 'Newest Followers', ...bottomTextFollowers],
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
			<TimeTextArray />
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
			<div className='drop-shadow' id='camera-box' />
			<div className='drop-shadow' id='screen-box' />
			{/* 			<div className='drop-shadow' id='terminal' />
			<div className='drop-shadow' id='vscode' />
			<div className='drop-shadow' id='browser' />
 */}{' '}
			<div className='drop-shadow' id='single' />{' '}
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
