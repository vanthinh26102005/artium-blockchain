type Props = {
  className?: string
  color?: string
}

const InfoIcon = (props: Props) => {
  return (
    <span className={props.className}>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="info"
        className="h-[1em] w-[1em]"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 19 19"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.7383 9.98425C17.7383 14.4025 14.1566 17.9843 9.73828 17.9843C5.32 17.9843 1.73828 14.4025 1.73828 9.98425C1.73828 5.56597 5.32 1.98425 9.73828 1.98425C14.1566 1.98425 17.7383 5.56597 17.7383 9.98425ZM18.7383 9.98425C18.7383 14.9548 14.7088 18.9843 9.73828 18.9843C4.76772 18.9843 0.738281 14.9548 0.738281 9.98425C0.738281 5.01369 4.76772 0.984253 9.73828 0.984253C14.7088 0.984253 18.7383 5.01369 18.7383 9.98425ZM10.5048 6.10656V4.60071H8.99899V6.10656H10.5048ZM9.28311 14.1189H6.59814V15.1133H12.8773V14.1189H10.4196V7.78289H6.59814V8.79153H9.28311V14.1189Z"
          fill={props.color || 'black'}
        />
      </svg>
    </span>
  )
}

export default InfoIcon
