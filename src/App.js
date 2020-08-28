import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'

import MusicTicker from './MusicTicker'
import { TickerItems } from './TickerItem'
import Clock from './Clock'
import Dashboard from './Dashboard'

import './App.css'

const socket = socketIOClient('https://overlayserver.travisk.info')

function App() {
	const [followers, setFollowers] = useState([])
	const [subscribers, setSubscribers] = useState([])
	const [streamTitle, setStreamTitle] = useState('No stream title')
	const [doingNow, setDoingNow] = useState('')
	const [doingLater, setDoingLater] = useState('')
	const [currentStatus, setCurrentStatus] = useState({
		mood: 3,
		anxiety: 3,
		mental: 3,
		physical: 3,
	})
	const [isEditorOpen, setEditorOpen] = React.useState(true)

	const topTickerItems = [
		{
			textArray: ['', '', streamTitle],
			color: 'purple',
			isFullyColored: false,
		},
		{
			text: streamTitle,
		},
		{
			emojis: ['🕒'],
			title: 'Doing Now:',
			text: doingNow,
			color: 'lightskyblue',
		},
		{
			emojis: ['🕒'],
			title: 'Doing Later:',
			text: doingLater,
			color: 'lightskyblue',
		},
		{
			title: 'mention me @travisk_streams in chat to get my attention',
			color: 'springgreen',
		},
		{
			emojis: ['📢'],
			title: 'Announcement:',
			text: 'Looking to hire a junior dev? https://hire.travisk.info',
			color: 'red',
		},
		{
			emojis: ['👀'],
			title: `4.1 average viewers (5 to join Live Coders group!)`,
			color: 'rgb(255, 150, 150)',
		},
		{
			emojis: ['📢'],
			title: 'Announcement:',
			text: 'please let me know if the stream is having any technical issues!',
			color: 'red',
		},
	]

	const bottomTextSubscribers = subscribers
		.map((subscriber) => subscriber.name)
		.filter((text, i) => i < 3)
		.join(' ♥ ')
	const bottomTextFollowers = followers.filter((text, i) => i < 3).join(' ♥ ')

	const bottomTickerItemsNew = [
		{
			emojis: ['🧡', '🧡'],
			title: 'Latest Subscribers',
			text: bottomTextSubscribers,
			color: 'orange',
		},
		{
			emojis: ['💜', '💜'],
			title: 'Latest Followers',
			text: bottomTextFollowers,
			color: 'violet',
		},
		{
			emojis: ['🍅', '🍅'],
			title: 'Pomodoro Technique',
			text: '1) work for 25 minutes 2) break for 5 minutes 3) repeat!',
			color: 'red',
		},
		{
			emojis: ['👩🏼', '🤔', '📊'],
			title: 'Current Status',
			text: `Mood: ${currentStatus.mood}/6, Anxiety: ${currentStatus.anxiety}/6, Energy (Mental): ${currentStatus.mental}/6, Energy (Physical): ${currentStatus.physical}/6 `,
			color: '#ff5080',
		},
	]

	useEffect(() => {
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
					<TickerItems items={bottomTickerItemsNew}>
						<MusicTicker />
					</TickerItems>
					<TickerItems items={bottomTickerItemsNew}>
						<MusicTicker />
					</TickerItems>
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
				<Dashboard
					doingNow={doingNow}
					setDoingNow={(e) => {
						setDoingNow(e.target.value)
					}}
					onBlurDoingNow={() => socket.emit('doing-now', doingNow)}
					doingLater={doingLater}
					setDoingLater={(e) => setDoingLater(e.target.value)}
					onBlurDoingLater={() => socket.emit('doing-later', doingLater)}
					currentStatus={currentStatus}
					onChangeMood={(e) => {
						setCurrentStatus({
							...currentStatus,
							mood: e.target.value,
						})
						socket.emit('mood', e.target.value)
					}}
					onChangeAnxiety={(e) => {
						setCurrentStatus({
							...currentStatus,
							anxiety: e.target.value,
						})
						socket.emit('anxiety', e.target.value)
					}}
					onChangeMentalEnergy={(e) => {
						setCurrentStatus({
							...currentStatus,
							mental: e.target.value,
						})
						socket.emit('energy-mental', e.target.value)
					}}
					onChangePhysicalEnergy={(e) => {
						setCurrentStatus({
							...currentStatus,
							physical: e.target.value,
						})
						socket.emit('energy-physical', e.target.value)
					}}
				/>
			</div>
		</div>
	)
}

export default App
