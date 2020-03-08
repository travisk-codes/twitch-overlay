import React from 'react'
import Scroll from 'react-textscroll'

import './App.css'

const TickerItems = () => (
	<>
		<div className='ticker__item text'>
			🕒 <span style={{ color: 'lightskyblue' }}>Doing now:&nbsp;</span> getting
			top text to scroll
		</div>
		<div className='ticker__item text'>
			🕒 <span style={{ color: 'dodgerblue' }}>Doing later:&nbsp;</span> fixing
			streamlabs alerts
		</div>
		<div className='ticker__item text'>
			🕒 <span style={{ color: 'rgb(64, 64, 255)' }}>10PM EST:&nbsp;</span>{' '}
			playing CS:GO / Trackmania
		</div>
		<div className='ticker__item text'>
			📢 &nbsp;<span style={{ color: 'red' }}>Announcement:&nbsp;</span> Found
			my missing lip balm (favorite)
		</div>
		<div className='ticker__item text' style={{ color: 'rgb(150, 255, 150)' }}>
			🛣️ &nbsp;Road to Affiliate:
		</div>
		<div className='ticker__item text' style={{ color: 'rgb(150, 150, 255)' }}>
			🙋🏼‍♀️ 27/50 followers (over half way there!)
		</div>
		<div className='ticker__item text' style={{ color: 'rgb(255, 150, 150)' }}>
			👀 &nbsp;0.8/3 average viewers
		</div>
	</>
)

function TickerSets() {}

function App() {
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
			<div className='drop-shadow' id='camera-box' />
		</div>
	)
}

export default App
