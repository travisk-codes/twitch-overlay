import React from 'react'

export const TickerItem = ({ textArray, color, isFullyColored }) => (
	<div
		className={`ticker__item text`}
		style={{
			color: isFullyColored ? color : null,
		}}
	>
		<span role='img' aria-label='emoji'>
			{textArray[0]}
		</span>
		&nbsp;
		<span style={{ color }}>{textArray[1]}</span>
		&nbsp;
		{textArray.map((_, i) =>
			i > 1 ? (
				<span className='ticker-item' data-content={textArray[i]} key={i}>
					{textArray[i]}&nbsp;
				</span>
			) : null,
		)}
	</div>
)

const TickerItems = ({ items }) => (
	<>
		{items.map((props, i) => (
			<span key={i}>
				<TickerItem {...props} />
			</span>
		))}
	</>
)

export default TickerItems

/**
 * case 1:
 * emoji
 * title w/ color
 * emoji
 * text
 *
 * case 2:
 * emoji
 * text
 *
 * case 3:
 * emoji
 * title
 * text
 *
 * case 4:
 * text
 *
 * case 5:
 * title w/ color
 *
 * case 6:
 * text
 

const tickerItem = {
	color: 'red',
	firstEmoji: 'asdf', // false
	secondEmoji: false,
	title: 'Announcement', // false
	text: 'this is an announcement',
}

const TickerItem2 = ({ item }) => <div className='ticker__item text'></div>
*/
