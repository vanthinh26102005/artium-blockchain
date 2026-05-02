type Props = {
  className?: string
  color?: string
}

const PencilIcon = (props: Props) => {
  return (
    <svg
      className={props.className}
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="pencil"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 15"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1995 1.18934C10.6138 0.603553 9.66401 0.603553 9.07823 1.18934L0.68934 9.57823C0.408035 9.85953 0.25 10.2411 0.25 10.6389V13.5858C0.25 14 0.585785 14.3358 1 14.3358H3.9469C4.34472 14.3358 4.72625 14.1778 5.00756 13.8964L13.3964 5.50756C13.9822 4.92177 13.9822 3.97203 13.3964 3.38624L11.1995 1.18934ZM9.78533 1.89645C9.9806 1.70118 10.2972 1.70118 10.4924 1.89645L12.6893 4.09335C12.8846 4.28861 12.8846 4.60519 12.6893 4.80045L11.9091 5.58068L9.0051 2.67668L9.78533 1.89645ZM8.298 3.38378L1.39645 10.2853C1.30268 10.3791 1.25 10.5063 1.25 10.6389V13.3358H3.9469C4.07951 13.3358 4.20668 13.2831 4.30045 13.1893L11.202 6.28779L8.298 3.38378Z"
        fill={props.color || 'black'}
      />
    </svg>
  )
}

export default PencilIcon
