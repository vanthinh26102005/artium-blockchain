import classNames from 'classnames'

type Props = {
  className?: string
  color?: string
  fillColor?: boolean
}

const BookmarkIcon = (props: Props) => {
  return (
    <span className={props.className}>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="bookmark"
        className={classNames('inline-flex h-[1em] w-[1em] items-center justify-center')}
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 20"
        fill="white"
      >
        {props.fillColor ? (
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.8491 17.9718C15.8491 19.6803 13.6828 20.4164 12.642 19.0615L8.90281 14.194C8.50046 13.6703 7.70793 13.6796 7.31799 14.2126L3.91478 18.8647C2.89349 20.2608 0.682456 19.5384 0.682456 17.8087L0.682457 0.588867L15.8491 0.588871L15.8491 17.9718Z"
            fill="#0F6BFF"
          />
        ) : (
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.1801 1.75622L1.3468 1.75622L1.3468 17.5062C1.3468 18.464 2.06329 18.864 2.62881 18.091L6.03201 13.4565C6.73623 12.4938 8.5477 12.477 9.27431 13.4229L13.0135 18.4127C13.5898 19.1629 14.1801 18.7554 14.1801 17.8093L14.1801 1.75622ZM15.3468 17.9725C15.3468 19.681 13.1805 20.417 12.1396 19.0622L8.40049 14.1947C7.99815 13.671 7.20561 13.6802 6.81567 14.2133L3.41246 18.8654C2.39117 20.2615 0.180137 19.5391 0.180137 17.8093L0.180137 0.589553L15.3468 0.589558L15.3468 17.9725Z"
            fill="black"
          />
        )}
      </svg>
    </span>
  )
}

export default BookmarkIcon
