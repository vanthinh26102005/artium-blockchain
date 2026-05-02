import cn from 'classnames'

type LiveIconProps = {
  className?: string
}

const LiveIcon = (props: LiveIconProps) => {
  return (
    <span className={cn('relative', props.className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h-full w-full" src="/icons/live.gif" alt="Live Icon" />
    </span>
  )
}

export default LiveIcon
