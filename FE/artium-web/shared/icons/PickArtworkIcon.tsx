type Props = {
  backgroundColor?: string
  iconFillColor?: string
}

const PickArtworkIcon = (props: Props) => {
  const { backgroundColor = 'white', iconFillColor = 'black' } = props
  return (
    <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_b_2894_103749)">
        <rect x="0.5" y="0.839844" width="30" height="30" rx="15" fill={backgroundColor} />
        <path
          d="M16.8887 12.2285L15.3887 10.7285C14.008 9.3478 11.7694 9.3478 10.3887 10.7285V10.7285C9.00796 12.1092 9.00796 14.3478 10.3887 15.7285L11.8887 17.2285M13.8887 19.2285L15.3887 20.7285C16.7694 22.1092 19.008 22.1092 20.3887 20.7285V20.7285C21.7694 19.3478 21.7694 17.1092 20.3887 15.7285L18.8887 14.2285M12.8887 13.2285L17.8887 18.2285"
          stroke={iconFillColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="1" y="1.33984" width="29" height="29" rx="14.5" stroke={iconFillColor} strokeOpacity="0.1" />
      </g>
      <defs>
        <filter
          id="filter0_b_2894_103749"
          x="-99.5"
          y="-99.1602"
          width="230"
          height="230"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="50" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_2894_103749" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_2894_103749" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

export default PickArtworkIcon
