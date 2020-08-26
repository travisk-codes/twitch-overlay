import React from 'react'
import socketIOClient from 'socket.io-client'

import MusicTicker from './MusicTicker'
import TickerItems from './Tickers'
import Clock from './Clock'

import './App.css'

const socket = socketIOClient('https://overlayserver.travisk.info')

function App() {
	console.log('app')
	const [followers, setFollowers] = React.useState([])
	const [subscribers, setSubscribers] = React.useState([])
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

	const textEntries = {
		'doing now': doingNow,
		'then later': doingLater,
		announcement1: 'mention me @travisk_streams in chat to get my attention',
		announcement2:
			'please let me know if the stream is having any technical issues!',
		announcement3: 'Looking to hire a junior dev? https://hire.travisk.info',
		'avg followers': '3.7',
		'current status': `Mood: ${currentStatus.mood}/6, Anxiety: ${currentStatus.anxiety}/6, Energy (Mental): ${currentStatus.mental}/6, Energy (Physical): ${currentStatus.physical}/6 `,
		'Pomodoro Technique':
			'time management technique where one works for 25 minutes and breaks for 5, ',
	}

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
		{
			textArray: ['', '', textEntries['announcement1']],
			color: 'lime',
			isFullyColored: true,
		},
		/* 				{
			textArray: ['🎉', 'AFFILIATE GET!'],
			color: 'rgb(150, 255, 150)',
			isFullyColored: true,
		},
 {
			textArray: ['🙋🏼‍♀️', followers.length + '/50 followers 💜 Thank You! 💜'],
			color: 'rgb(150, 150, 255)',
			isFullyColored: true,
		},
 */ {
			textArray: ['📢', 'Announcement:', textEntries['announcement3']],
			color: 'red',
			isFullyColored: false,
		},
		{
			textArray: [
				'👀',
				`${textEntries['avg followers']} average viewers (5 to join Live Coders group!)`,
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

	const bottomTextSubscribers = subscribers
		.map((subscriber) => subscriber.name)
		.filter((text, i) => i < 3)
		.join(' ♥ ')
	const bottomTextFollowers = followers.filter((text, i) => i < 3).join(' ♥ ')

	const bottomTickerItems = [
		{
			textArray: [' 🧡 ', 'Latest Subscribers 🧡 ', bottomTextSubscribers],
			color: 'orange',
			isFullyColored: false,
		},
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
				'🍅',
				'Pomodoro Technique:',
				'work for 25 minutes, break for 5, repeat!',
			],
			color: 'red',
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

	React.useEffect(() => {
		console.log('useeffect')
		socket.on('follows', (data) => {
			const newFollowers = data.map((datum) => datum._data.from_name)
			if (newFollowers !== followers) setFollowers(newFollowers)
		})
		socket.on('streamTitleChange', (data) => setStreamTitle(data))
		socket.on('subscriptions', (data) => {
			console.log('subs')
			const newNameTimePairs = getSubNamesFromSubObjArray(data)
			console.log(newNameTimePairs)
			if (newNameTimePairs !== subscribers) setSubscribers(newNameTimePairs)
		})
		socket.on('doing-now', (data) => {
			if (data !== doingNow) setDoingNow(data)
		})
		socket.on('doing-later', (data) => {
			if (data !== doingLater) setDoingLater(data)
		})
		socket.on('anxiety', (data) => {
			if (data !== currentStatus.anxiety)
				setCurrentStatus((status) => ({
					...status,
					anxiety: data,
				}))
		})
		socket.on('energy-mental', (data) => {
			if (data !== currentStatus.mental)
				setCurrentStatus((status) => ({
					...status,
					mental: data,
				}))
		})
		socket.on('energy-physical', (data) => {
			if (data !== currentStatus.physical)
				setCurrentStatus((status) => ({
					...status,
					physical: data,
				}))
		})
		socket.on('mood', (data) => {
			if (data !== currentStatus.mood)
				setCurrentStatus((status) => ({
					...status,
					mood: data,
				}))
		})
		return () => socket.off('')
	}, [])

	const getSubNamesFromSubObjArray = (dataObject) => {
		const objectArray = dataObject.data
		let names = [],
			times = []
		objectArray.forEach((obj, i) => {
			if (obj._eventData.event_type === 'subscriptions.subscribe') {
				names.push(obj._data.user_name)
				times.push(obj._eventData.event_timestamp)
			}
		})
		const nameTimePairs = names.map((name, i) => ({ name, time: times[i] }))
		return nameTimePairs
	}

	return (
		<div className='App'>
			<div className='ticker-wrap'>
				<div className='ticker'>
					<TickerItems items={topTickerItems}>
						<Clock />
					</TickerItems>
					<TickerItems items={topTickerItems}>
						<Clock />
					</TickerItems>
				</div>
			</div>
			<div className='ticker-wrap-bottom'>
				<div className='ticker-bottom'>
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
							onChange={(e) => {
								setDoingNow(e.target.value)
							}}
							onBlur={() => socket.emit('doing-now', doingNow)}
						/>
					</label>
					<br />
					<label>
						{'Doing Later: '}
						<input
							className='ticker-text-input'
							value={doingLater}
							onChange={(e) => setDoingLater(e.target.value)}
							onBlur={() => socket.emit('doing-later', doingLater)}
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
							onChange={(e) => {
								setCurrentStatus({
									...currentStatus,
									mood: e.target.value,
								})
								socket.emit('mood', e.target.value)
							}}
						/>
					</label>
					<label>
						{' Anxiety: '}
						<input
							size='1'
							type='number'
							className='ticker-text-input'
							value={currentStatus.anxiety}
							onChange={(e) => {
								setCurrentStatus({
									...currentStatus,
									anxiety: e.target.value,
								})
								socket.emit('anxiety', e.target.value)
							}}
						/>
					</label>
					<label>
						{' Energy (Mental): '}
						<input
							size='1'
							type='number'
							className='ticker-text-input'
							value={currentStatus.mental}
							onChange={(e) => {
								setCurrentStatus({
									...currentStatus,
									mental: e.target.value,
								})
								socket.emit('energy-mental', e.target.value)
							}}
						/>
					</label>
					<label>
						{' Energy (Physical): '}
						<input
							size='1'
							type='number'
							className='ticker-text-input'
							value={currentStatus.physical}
							onChange={(e) => {
								setCurrentStatus({
									...currentStatus,
									physical: e.target.value,
								})
								socket.emit('energy-physical', e.target.value)
							}}
						/>
					</label>

					<div>
						<a href='https://overlayserver.travisk.info/login'>
							{'Log in to Spotify'}
						</a>
					</div>
					<div>
						<a href='https://overlayserver.travisk.info/twitch-login'>
							{'Log in to Twitch'}
						</a>
					</div>
				</form>
			</div>
		</div>
	)
}

export default App
