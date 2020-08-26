import React from 'react'
import './ticker-styles.css'

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
				<span className='ticker-item-old' data-content={textArray[i]} key={i}>
					{textArray[i]}&nbsp;
				</span>
			) : null,
		)}
	</div>
)

const TickerItems = ({ items, children }) => (
	<>
		{children ? <span key={0}>{children}</span> : null}
		{items.map((props, i) => (
			<span key={i + 1}>
				<TickerItemNew {...props} />
			</span>
		))}
	</>
)

export default TickerItems

export const TickerItemNew = ({ color, emojis, title, text }) => (
	<span className='ticker-item'>
		{emojis && emojis[0] ? (
			<span className='ticker-item__emoji' role='img' aria-label='emoji'>
				{emojis[0]}
			</span>
		) : null}

		{title ? (
			<span
				style={color ? { color } : { color: 'white' }}
				className='ticker-item__title'
				data-content={title}
			>
				{title}
			</span>
		) : null}

		{emojis && emojis[1] ? (
			<span className='ticker-item__emoji' role='img' aria-label='emoji'>
				{emojis[1]}
			</span>
		) : null}

		{text ? (
			<span className='ticker-item__text' data-content={text}>
				{text}
			</span>
		) : null}

		{emojis && emojis[2] ? (
			<span className='ticker-item__emoji' role='img' aria-label='emoji'>
				{emojis[2]}
			</span>
		) : null}
	</span>
)
