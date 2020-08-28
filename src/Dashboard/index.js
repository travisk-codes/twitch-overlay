import React from 'react'

export default ({
	doingNow,
	setDoingNow,
	onBlurDoingNow,
	doingLater,
	setDoingLater,
	onBlurDoingLater,
	currentStatus,
	onChangeMood,
	onChangeAnxiety,
	onChangeMentalEnergy,
	onChangePhysicalEnergy,
}) => (
	<form>
		<label>
			{'Doing Now: '}
			<input
				className='ticker-text-input'
				value={doingNow}
				onChange={setDoingNow}
				onBlur={onBlurDoingNow}
			/>
		</label>
		<br />
		<label>
			{'Doing Later: '}
			<input
				className='ticker-text-input'
				value={doingLater}
				onChange={setDoingLater}
				onBlur={onBlurDoingLater}
			/>
		</label>
		<br />
		<label>
			Mood:
			<input
				size='1'
				type='number'
				className='ticker-text-input'
				value={currentStatus.mood}
				onChange={onChangeMood}
			/>
		</label>
		<label>
			Anxiety:
			<input
				size='1'
				type='number'
				className='ticker-text-input'
				value={currentStatus.anxiety}
				onChange={onChangeAnxiety}
			/>
		</label>
		<label>
			Mental Energy:
			<input
				size='1'
				type='number'
				className='ticker-text-input'
				value={currentStatus.mental}
				onChange={onChangeMentalEnergy}
			/>
		</label>
		<label>
			Physical Energy:
			<input
				size='1'
				type='number'
				className='ticker-text-input'
				value={currentStatus.physical}
				onChange={onChangePhysicalEnergy}
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
)
