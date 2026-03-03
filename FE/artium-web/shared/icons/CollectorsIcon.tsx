import classNames from 'classnames'
import { SVGProps } from 'react'

const CollectorsIcon = ({ fill = '#191414', className, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <span className={className}>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="collectors"
        className={classNames('inline-flex h-[1em] w-[1em] items-center justify-center')}
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 22"
        fill="none"
        {...props}
      >
        <path
          d="M11.594 10.0047C11.5144 9.7562 11.375 9.53104 11.1881 9.34896C11.0012 9.16688 10.7725 9.03344 10.522 8.96035C10.2716 8.88725 10.007 8.87672 9.75148 8.9297C9.49598 8.98267 9.25739 9.09753 9.05663 9.26419C8.85586 9.43085 8.69905 9.64422 8.59996 9.8856C8.50086 10.127 8.46251 10.389 8.48825 10.6486C8.514 10.9083 8.60306 11.1577 8.74763 11.3749C8.8922 11.5921 9.08785 11.7705 9.31744 11.8945"
          stroke={fill}
          strokeWidth="1.19609"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.47479 15.0995C6.30428 14.6043 4.44556 13.0686 2.89941 10.4914C4.81316 7.30182 7.20534 5.70703 10.076 5.70703C12.7329 5.70703 14.9799 7.07376 16.8171 9.80563"
          stroke={fill}
          strokeWidth="1.19609"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.8596 18.4643L17.5309 15.8456C17.6947 15.6867 17.825 15.4965 17.9141 15.2863C18.0032 15.0762 18.0493 14.8503 18.0497 14.6221C18.05 14.3938 18.0047 14.1678 17.9162 13.9574C17.8278 13.7469 17.6981 13.5563 17.5348 13.3968C17.2016 13.071 16.7544 12.8881 16.2883 12.8872C15.8222 12.8863 15.3743 13.0675 15.0398 13.392L14.8612 13.5675L14.6834 13.392C14.3502 13.0664 13.9031 12.8837 13.4372 12.8828C12.9713 12.8819 12.5235 13.0629 12.1891 13.3873C12.0253 13.5462 11.8949 13.7363 11.8057 13.9464C11.7165 14.1565 11.6704 14.3824 11.6699 14.6106C11.6695 14.8389 11.7148 15.0649 11.8031 15.2754C11.8915 15.4859 12.0211 15.6765 12.1843 15.8361L14.8596 18.4643Z"
          stroke={fill}
          strokeWidth="1.19609"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default CollectorsIcon
