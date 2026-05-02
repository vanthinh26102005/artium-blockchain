type IconProps = {
  color?: string
}

const TwitterIcon = (props: IconProps) => (
  <span data-nosnippet>
    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.34314 16.1536C0.34314 7.23219 7.57533 0 16.4967 0C25.4181 0 32.6502 7.23219 32.6502 16.1536C32.6502 25.0749 25.4181 32.3071 16.4967 32.3071C7.57533 32.3071 0.34314 25.0749 0.34314 16.1536Z"
        fill={props.color || 'white'}
      />
      <g clipPath="url(#clip0_801_214828)">
        <path
          d="M8.66638 8.58008L19.4216 23.2467H23.333L12.5778 8.58008H8.66638Z"
          stroke="black"
          strokeWidth="1.375"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.66638 23.2467L14.8704 17.0427M17.1254 14.7877L23.333 8.58008"
          stroke="black"
          strokeWidth="1.375"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_801_214828">
          <rect width="22" height="22" fill="white" transform="translate(4.99939 4.91406)" />
        </clipPath>
      </defs>
    </svg>
  </span>
)

export default TwitterIcon
