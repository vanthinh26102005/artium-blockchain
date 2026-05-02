const LoginAsIcon = (props: React.SVGProps<SVGSVGElement> & { color?: string }) => (
  <span data-nosnippet>
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" {...props}>
      <g clipPath="url(#clip0_2231_99518)">
        <path
          d="M14.25 8V6C14.25 5.46957 14.0393 4.96086 13.6642 4.58579C13.2891 4.21071 12.7804 4 12.25 4H5.25C4.71957 4 4.21086 4.21071 3.83579 4.58579C3.46071 4.96086 3.25 5.46957 3.25 6V18C3.25 18.5304 3.46071 19.0391 3.83579 19.4142C4.21086 19.7893 4.71957 20 5.25 20H12.25C12.7804 20 13.2891 19.7893 13.6642 19.4142C14.0393 19.0391 14.25 18.5304 14.25 18V16"
          stroke={props.color || '#0F6BFF'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.25 12H21.25L18.25 9"
          stroke={props.color || '#0F6BFF'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.25 15L21.25 12"
          stroke={props.color || '#0F6BFF'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2231_99518">
          <rect width="24" height="24" fill="white" transform="translate(0.25)" />
        </clipPath>
      </defs>
    </svg>
  </span>
)

export default LoginAsIcon
