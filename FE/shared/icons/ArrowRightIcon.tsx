/*
 * Created on Tue Jan 18 2022
 *
 * Copyright (c) 2022 Artium Inc - All Rights Reserved
 * Unauthorized copying of this file via any medium is strictly prohibited
 * Proprietary and confidential
 * Copyright terms written by Artium Inc <support@Artium.co>, Tue Jan 18 2022
 */

import classNames from 'classnames'

type ArrowRightIconProps = {
  className?: string
  color?: string
}

const ArrowRightIcon = (props: ArrowRightIconProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="close"
      className={classNames('h-[1em] w-[1em]', props.className)}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 20"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.6638 19.25L21.207 10.7068L21.9141 9.99974L21.207 9.29263L12.6638 0.749477L11.2496 2.16369L17.9979 8.91199L0.0851727 8.91199V10.912L18.1734 10.912L11.2496 17.8358L12.6638 19.25Z"
        fill={props.color || 'black'}
      />
    </svg>
  )
}

export default ArrowRightIcon
