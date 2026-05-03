import { useMemo } from 'react'
import { MessageCircle, Clock } from 'lucide-react'
import type { Conversation } from '@/types/messaging'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/@shared/components/ui/user-avatar'

type ConversationsListProps = {
  conversations: Conversation[]
  selectedConversationId?: string | null
  onSelectConversation: (conversationId: string) => void
  isLoading?: boolean
}

/**
 * ConversationsList - React component
 * @returns React element
 */
export const ConversationsList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false,
}: ConversationsListProps) => {
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
/**
 * sortedConversations - Utility function
 * @returns void
 */
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return bTime - aTime
    })
  }, [conversations])

/**
 * aTime - Utility function
 * @returns void
 */
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-slate-500">Loading conversations...</div>
/**
 * bTime - Utility function
 * @returns void
 */
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <MessageCircle className="h-12 w-12 text-slate-300" />
        <p className="mt-4 text-sm text-slate-600">No conversations yet</p>
        <p className="mt-1 text-xs text-slate-500">
          Start a conversation to connect with collectors
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.map((conversation) => {
          const isSelected = conversation.id === selectedConversationId
          const hasUnread = false

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                <UserAvatar src={conversation.imageUrl} name={conversation.name} size="md" />
/**
 * isSelected - Utility function
 * @returns void
 */

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
/**
 * hasUnread - Utility function
 * @returns void
 */
                      className={`truncate text-sm font-semibold ${hasUnread ? 'text-slate-900' : 'text-slate-700'
                        }`}
                    >
                      {conversation.name || 'Conversation'}
                    </h3>
                    {conversation.lastMessageAt && (
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                          addSuffix: false,
                        })}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1">
                    {conversation.lastMessageContent ? (
                      <p
                        className={`truncate text-xs ${hasUnread ? 'font-medium text-slate-700' : 'text-slate-500'
                          }`}
                      >
                        {conversation.lastMessageContent}
                      </p>
                    ) : (
                      <p className="text-xs italic text-slate-400">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
