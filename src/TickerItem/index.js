import React from 'react'
import './styles.css'

const TickerItem = ({ color, emojis, title, text }) => (
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

export default TickerItem

export const TickerItems = ({ items, children }) => (
	<>
		{children ? <span key={0}>{children}</span> : null}
		{items.map((props, i) => (
			<span key={i + 1}>
				<TickerItem {...props} />
			</span>
		))}
	</>
)
