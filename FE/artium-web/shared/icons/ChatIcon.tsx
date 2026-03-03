const ChatIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <span data-nosnippet>
      <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g clipPath="url(#clip0_2422_8900)">
          <path
            d="M3.25 20.9099L4.55 17.0099C2.226 13.5729 3.124 9.13788 6.65 6.63588C10.176 4.13488 15.24 4.33988 18.495 7.11588C21.75 9.89288 22.19 14.3819 19.524 17.6169C16.858 20.8519 11.909 21.8319 7.95 19.9099L3.25 20.9099Z"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_2422_8900">
            <rect width="24" height="24" fill="white" transform="translate(0.25 0.910156)" />
          </clipPath>
        </defs>
      </svg>
    </span>
  )
}

export default ChatIcon
