import classNames from 'classnames'

type AngleTopIconProps = {
  className?: string
  color?: string
}

const AngleTopIcon = (props: AngleTopIconProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="angle-top"
      className={classNames('h-[1em] w-[1em] scale-75', props.className)}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 15"
      fill="none"
    >
      <path d="M1 1L14 13L27 1" stroke={props.color || 'black'} strokeWidth="2" />
    </svg>
  )
}

export default AngleTopIcon
