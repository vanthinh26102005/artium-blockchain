/*
 * Created on Mon Dec 27 2021
 *
 * Copyright (c) 2021 Artium Inc - All Rights Reserved
 * Unauthorized copying of this file via any medium is strictly prohibited
 * Proprietary and confidential
 * Copyright terms written by Artium Inc <support@Artium.co>, Mon Dec 27 2021
 */

import classNames from 'classnames'

type PlayIconProps = {
  className?: string
}

const PlayIcon = (props: PlayIconProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="play"
      className={classNames('h-[1em] w-[1em]', props.className)}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 34 40"
    >
      <g filter="url(#filter0_dd_11827_100528)">
        <path
          d="M7 27.5023V4.49774C7 3.03367 8.65486 2.18204 9.84623 3.03302L25.9494 14.5353C26.9544 15.2532 26.9544 16.7468 25.9494 17.4647L9.84623 28.967C8.65487 29.818 7 28.9663 7 27.5023Z"
          fill="#FCFCFC"
          stroke="#E9E9E9"
          strokeWidth="0.8"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_11827_100528"
          x="0.600098"
          y="-1"
          width="33.3999"
          height="42"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect1_dropShadow_11827_100528" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.06 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_11827_100528" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect2_dropShadow_11827_100528" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_11827_100528" result="effect2_dropShadow_11827_100528" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_11827_100528" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

export default PlayIcon
