export const SmileChatIcon = (props: React.SVGProps<SVGSVGElement> & { color?: string }) => (
  <span data-nosnippet>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <g clipPath="url(#clip0_1129_121403)">
        <path
          d="M15.9583 1.875C16.7485 1.875 17.5062 2.19223 18.0649 2.75691C18.6236 3.32159 18.9375 4.08745 18.9375 4.88603V12.9154C18.9375 13.714 18.6236 14.4799 18.0649 15.0446C17.5062 15.6092 16.7485 15.9265 15.9583 15.9265H10.9931L6.02778 18.9375V15.9265H4.04167C3.25154 15.9265 2.49378 15.6092 1.93508 15.0446C1.37638 14.4799 1.0625 13.714 1.0625 12.9154V4.88603C1.0625 4.08745 1.37638 3.32159 1.93508 2.75691C2.49378 2.19223 3.25154 1.875 4.04167 1.875H15.9583Z"
          stroke={props.color || 'black'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.75 10C7.17364 10.7717 7.6793 11.3848 8.23736 11.8034C8.79543 12.2219 9.39467 12.4375 10 12.4375C10.6053 12.4375 11.2046 12.2219 11.7626 11.8034C12.3207 11.3848 12.8264 10.7717 13.25 10H6.75Z"
          stroke={props.color || 'black'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="5.53125" cy="7.15625" r="1.21875" fill={props.color || 'black'} />
        <circle cx="14.0625" cy="7.15625" r="1.21875" fill={props.color || 'black'} />
      </g>
      <defs>
        <clipPath id="clip0_1129_121403">
          <rect width="19.5" height="19.5" fill="white" transform="translate(0.25 0.25)" />
        </clipPath>
      </defs>
    </svg>
  </span>
)
