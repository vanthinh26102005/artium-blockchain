type Props = {
  className?: string
  color?: string
}

const PinIcon = (props: Props) => {
  const { color = 'black' } = props
  return (
    <span className={props.className}>
      <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_2028_146689)">
          <path
            d="M15.8633 5L11.8633 9L7.86328 10.5L6.36328 12L13.3633 19L14.8633 17.5L16.3633 13.5L20.3633 9.5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.86328 15.5L5.36328 20"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.3633 4.5L20.8633 10"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_2028_146689">
            <rect width="24" height="24" fill="white" transform="translate(0.863281 0.5)" />
          </clipPath>
        </defs>
      </svg>
    </span>
  )
}

export default PinIcon
