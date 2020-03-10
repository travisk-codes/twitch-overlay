import React from 'react'

import './App.css'

const TimeTextArray = () => {
	const [textArray, setTextArray] = React.useState([])
	let interval
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
			'US',
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

	function tick() {
		setTextArray(getTimeTextArray())
	}

	React.useEffect(() => {
		interval = setInterval(() => tick(), 1000)
	})

	return (
		<TickerItem
			textArray={textArray}
			color='lightskyblue'
			isFullyColored={true}
		/>
	)
}

const tickerItems = [
	{
		textArray: ['🕒', 'Doing Now:', 'cleaning up overlay code'],
		color: 'lightskyblue',
		isFullyColored: false,
	},
	{
		textArray: ['🕒', 'Then Later:', 'sleep'],
		color: 'dodgerblue',
		isFullyColored: false,
	},
	/* 	{
		textArray: ['🕒', '10PM EST', 'playing CSGO, Trackmania'],
		color: 'rgb(64, 64, 255)',
		isFullyColored: false,
	},
 */ {
		textArray: ['📢', 'Announcement', `I'm so tired`],
		color: 'red',
		isFullyColored: false,
	},
	{
		textArray: ['🛣️', 'Road to Affiliate:'],
		color: 'rgb(150, 255, 150)',
		isFullyColored: true,
	},
	{
		textArray: ['🙋🏼‍♀️', '30/50 followers (over half way there!)'],
		color: 'rgb(150, 150, 255)',
		isFullyColored: true,
	},
	{
		textArray: ['👀', '1.04/3 average viewers'],
		color: 'rgb(255, 150, 150)',
		isFullyColored: true,
	},
]

const Emoji = ({ emoji }) => (
	<span role='img' aria-label='emoji'>
		{emoji}
	</span>
)

const TickerItem = ({ textArray, color, isFullyColored }) => (
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
	</div>
)

const TickerItems = () => (
	<>
		{tickerItems.map(props => (
			<TickerItem {...props} />
		))}
	</>
)

function App() {
	return (
		<div className='App'>
			<div className='ticker-wrap'>
				<div className='ticker'>
					<TimeTextArray />
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
			<div className='drop-shadow' id='camera-box' />
		</div>
	)
}

export default App
