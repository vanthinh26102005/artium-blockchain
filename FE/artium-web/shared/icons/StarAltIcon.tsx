import classNames from 'classnames'

const StarAltIcon = ({ className, color = 'white' }: { className?: string; color?: string }) => (
  <svg
    className={classNames('h-[25px] w-[25px]', className)}
    viewBox="0 0 25 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 0.5C13.7228 6.82851 18.6715 11.7772 25 13C18.6715 14.2228 13.7228 19.1715 12.5 25.5C11.2772 19.1715 6.32851 14.2228 0 13C6.32851 11.7772 11.2772 6.82851 12.5 0.5Z"
      fill={color}
    />
  </svg>
)

export default StarAltIcon
