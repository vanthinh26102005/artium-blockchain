import cn from 'classnames'

type SpinnerIconProps = {
  className?: string
  color?: 'primary' | 'white'
}

const SpinnerIcon = (props: SpinnerIconProps) => {
  const { color = 'primary', className } = props
  return (
    <span
      className={cn(
        'mx-1 inline-block h-[1em] w-[1em] animate-spin rounded-full border-2 border-l-transparent ',
        color === 'white' && 'border-b-white  border-r-white border-t-white',
        color === 'primary' && 'border-b-primary  border-r-primary border-t-primary',
        className,
      )}
    />
  )
}

export default SpinnerIcon
