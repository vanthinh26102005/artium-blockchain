type Reaction = {
  userId: string
  emoji: string
  createdAt: string
}

type MessageReactionsProps = {
  reactions?: Reaction[]
  currentUserId: string
  onReact?: (emoji: string) => void
}

export const MessageReactions = ({ reactions, currentUserId, onReact }: MessageReactionsProps) => {
  if (!reactions || reactions.length === 0) return null

  const reactionGroups = reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = []
      }
      acc[reaction.emoji].push(reaction)
      return acc
    },
    {} as Record<string, Reaction[]>,
  )

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {Object.entries(reactionGroups).map(([emoji, reactionList]) => {
        const hasReacted = reactionList.some((r) => r.userId === currentUserId)
        const count = reactionList.length

        return (
          <button
            key={emoji}
            onClick={() => onReact?.(emoji)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
              hasReacted
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
