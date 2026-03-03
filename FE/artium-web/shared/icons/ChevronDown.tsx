import classNames from 'classnames'

type ChevronDownProps = {
  className?: string
  color?: string
}

const ChevronDown = (props: ChevronDownProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="chevron-down"
      className={classNames('h-[1em] w-[1em] origin-center', props.className)}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 27"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.14449 10.3812C3.33976 10.186 3.65634 10.186 3.8516 10.3812L11.9233 18.453L19.9951 10.3812C20.1903 10.186 20.5069 10.186 20.7022 10.3812C20.8974 10.5765 20.8974 10.8931 20.7022 11.0883L12.2769 19.5136L11.9233 19.8672L11.5698 19.5136L3.14449 11.0883C2.94923 10.8931 2.94923 10.5765 3.14449 10.3812Z"
        fill={props.color || 'black'}
      />
    </svg>
  )
}

export default ChevronDown
