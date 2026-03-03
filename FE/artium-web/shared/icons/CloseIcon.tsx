/*
 * Created on Mon Dec 27 2021
 *
 * Copyright (c) 2021 Artium Inc - All Rights Reserved
 * Unauthorized copying of this file via any medium is strictly prohibited
 * Proprietary and confidential
 * Copyright terms written by Artium Inc <support@Artium.co>, Mon Dec 27 2021
 */

import classNames from 'classnames'

type CloseIconProps = {
  className?: string
  color?: string
}

const CloseIcon = (props: CloseIconProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="close"
      className={classNames('h-[1em] w-[1em]', props.className)}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 31"
    >
      <path d="M25.6058 25.6068L4.39258 4.39355" stroke={props.color || 'black'} strokeMiterlimit="10" />
      <path d="M25.6058 4.39324L4.39258 25.6064" stroke={props.color || 'black'} strokeMiterlimit="10" />
    </svg>
  )
}

export default CloseIcon
