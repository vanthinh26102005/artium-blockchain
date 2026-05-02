const CopyIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill="none"
    >
      <path
        d="M10.3887 6.38867L8.88867 4.88867C7.50796 3.50796 5.26938 3.50796 3.88867 4.88867V4.88867C2.50796 6.26938 2.50796 8.50796 3.88867 9.88867L5.38867 11.3887M7.38867 13.3887L8.88867 14.8887C10.2694 16.2694 12.508 16.2694 13.8887 14.8887V14.8887C15.2694 13.508 15.2694 11.2694 13.8887 9.88867L12.3887 8.38867M6.38867 7.38867L11.3887 12.3887"
        stroke="black"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default CopyIcon
