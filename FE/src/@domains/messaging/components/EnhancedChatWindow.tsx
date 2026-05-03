import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Image as ImageIcon, File, Check, CheckCheck } from 'lucide-react'
import type { Message } from '@/types/messaging'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { ImageLightbox } from './ImageLightbox'

type EnhancedChatWindowProps = {
  messages: Message[]
  currentUserId: string
  isLoading?: boolean
  typingUsers?: string[]
  onLoadMore?: () => void
  onEditMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onReactToMessage?: (messageId: string, emoji: string) => void
}

/**
 * EnhancedChatWindow - React component
 * @returns React element
 */
export const EnhancedChatWindow = ({
  messages,
  currentUserId,
  isLoading = false,
  typingUsers = [],
  onLoadMore,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
}: EnhancedChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  /**
   * messagesEndRef - Utility function
   * @returns void
   */
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  /**
   * scrollContainerRef - Utility function
   * @returns void
   */
  const [lightboxImages, setLightboxImages] = useState<
    Array<{ url: string; alt?: string; messageId: string }>
  >([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
  }, [messages, isAtBottom])
  /**
   * scrollToBottom - Utility function
   * @returns void
   */

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const atBottom = scrollHeight - scrollTop - clientHeight < 50

    setIsAtBottom(atBottom)

    if (scrollTop === 0 && onLoadMore) {
      onLoadMore()
    }
  }
  /**
   * handleScroll - Utility function
   * @returns void
   */

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content || '')
  }

  const handleCancelEdit = () => {
    /**
     * atBottom - Utility function
     * @returns void
     */
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      onEditMessage?.(editingMessageId, editContent.trim())
      handleCancelEdit()
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    /**
     * handleStartEdit - Utility function
     * @returns void
     */
    setDeleteConfirmId(messageId)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteMessage?.(deleteConfirmId)
      setDeleteConfirmId(null)
    }
    /**
     * handleCancelEdit - Utility function
     * @returns void
     */
  }

  const handleImageClick = (messageId: string) => {
    const allImages = messages
      .filter((msg) => msg.type === 'IMAGE' && msg.mediaUrl)
      .map((msg) => ({
        url: msg.mediaUrl!,
        alt: 'Shared image',
        /**
         * handleSaveEdit - Utility function
         * @returns void
         */
        messageId: msg.id,
      }))

    const clickedIndex = allImages.findIndex((img) => img.messageId === messageId)

    setLightboxImages(allImages)
    setLightboxIndex(clickedIndex >= 0 ? clickedIndex : 0)
    setLightboxOpen(true)
  }

  /**
   * handleDeleteMessage - Utility function
   * @returns void
   */
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-slate-500">Loading messages...</div>
      </div>
    )
  }
  /**
   * confirmDelete - Utility function
   * @returns void
   */

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <div className="rounded-full bg-slate-100 p-4">
          <ImageIcon className="h-8 w-8 text-slate-400" />
        </div>
        <p className="mt-4 text-sm text-slate-600">No messages yet</p>
        <p className="mt-1 text-xs text-slate-500">Send a message to start the conversation</p>
      </div>
      /**
       * handleImageClick - Utility function
       * @returns void
       */
    )
  }

  return (
    /**
     * allImages - Utility function
     * @returns void
     */
    <>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex h-full flex-col overflow-y-auto px-4 py-6"
      >
        <div className="flex-1 space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId
            const isEditing = editingMessageId === message.id
            const showTimestamp =
              /**
               * clickedIndex - Utility function
               * @returns void
               */
              index === 0 ||
              new Date(messages[index - 1].createdAt).getTime() -
                new Date(message.createdAt).getTime() >
                300000

            return (
              <div key={message.id}>
                {showTimestamp && (
                  <div className="mb-4 text-center">
                    <span className="text-xs text-slate-500">
                      {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`group relative max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}
                  >
                    {message.isDeleted ? (
                      <div className="rounded-2xl bg-slate-100 px-4 py-2">
                        <p className="text-sm italic text-slate-500">This message was deleted</p>
                      </div>
                    ) : (
                      <div>
                        {message.mediaUrl && (
                          <div className="mb-2">
                            {message.type === 'IMAGE' ? (
                              <div
                                className="group relative cursor-pointer"
                                onClick={() => handleImageClick(message.id)}
                              >
                                <img
                                  src={message.mediaUrl}
                                  alt="Shared image"
                                  className="max-h-80 w-full rounded-lg object-cover transition-transform hover:scale-[1.02]"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    /**
                                     * isOwnMessage - Utility function
                                     * @returns void
                                     */
                                    target.src =
                                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E'
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-all hover:bg-black/10 hover:opacity-100">
                                  /** * isEditing - Utility function * @returns void */
                                  <span className="rounded bg-black/70 px-3 py-1 text-xs text-white">
                                    Click to view full size
                                  </span>
                                </div>
                                /** * showTimestamp - Utility function * @returns void */
                              </div>
                            ) : message.type === 'VIDEO' ? (
                              <video
                                src={message.mediaUrl}
                                controls
                                className="max-h-64 w-full rounded-lg"
                              >
                                Your browser does not support video playback.
                              </video>
                            ) : (
                              <a
                                href={message.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                              >
                                <File className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-700">
                                  {message.metadata?.fileName || 'View attachment'}
                                </span>
                              </a>
                            )}
                          </div>
                        )}

                        {isEditing ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full resize-none rounded border-none bg-transparent p-2 text-sm focus:outline-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="rounded px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                              <button
                                /**
                                 * target - Utility function
                                 * @returns void
                                 */
                                onClick={handleSaveEdit}
                                disabled={!editContent.trim()}
                                className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-primary/90 disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          message.content && (
                            <div className="relative">
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isOwnMessage
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 text-slate-900'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words text-sm">
                                  {message.content}
                                </p>
                                {message.isEdited && (
                                  <span
                                    className={`mt-1 block text-xs ${
                                      isOwnMessage ? 'text-white/70' : 'text-slate-500'
                                    }`}
                                  >
                                    (edited)
                                  </span>
                                )}
                              </div>

                              <div className="absolute right-2 top-2">
                                <MessageActions
                                  messageId={message.id}
                                  isOwnMessage={isOwnMessage}
                                  onEdit={() => handleStartEdit(message)}
                                  onDelete={() => handleDeleteMessage(message.id)}
                                  onReact={(emoji) => onReactToMessage?.(message.id, emoji)}
                                />
                              </div>
                            </div>
                          )
                        )}

                        <MessageReactions
                          reactions={message.reactions || []}
                          currentUserId={currentUserId}
                          onReact={(emoji) => onReactToMessage?.(message.id, emoji)}
                        />
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </span>
                      {isOwnMessage && (
                        <span className="text-slate-400">
                          {message.isEdited ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <DeleteConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
      />

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
