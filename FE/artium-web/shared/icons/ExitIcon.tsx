/*
 * Created on Mon Dec 27 2021
 *
 * Copyright (c) 2021 Artium Inc - All Rights Reserved
 * Unauthorized copying of this file via any medium is strictly prohibited
 * Proprietary and confidential
 * Copyright terms written by Artium Inc <support@Artium.co>, Mon Dec 27 2021
 */

import classNames from 'classnames'

type ExitIconProps = {
  className?: string
}

const ExitIcon = (props: ExitIconProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="exit"
      className={classNames('h-[1em] w-[1em]', props.className)}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 25 24"
    >
      <path d="M23.1068 22.7132L1.89355 1.5" stroke="black" strokeWidth="3" strokeMiterlimit="10" />
      <path d="M23.1068 1.2868L1.89355 22.5" stroke="black" strokeWidth="3" strokeMiterlimit="10" />
    </svg>
  )
}

export default ExitIcon
