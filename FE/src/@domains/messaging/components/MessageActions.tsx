import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2, Smile } from 'lucide-react'
import dynamic from 'next/dynamic'

/**
 * EmojiPicker - React component
 * @returns React element
 */
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

type MessageActionsProps = {
  messageId: string
  isOwnMessage: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReact?: (emoji: string) => void
}

export const MessageActions = ({
  messageId,
  isOwnMessage,
  /**
   * MessageActions - React component
   * @returns React element
   */
  onEdit,
  onDelete,
  onReact,
}: MessageActionsProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
        /**
         * menuRef - Utility function
         * @returns void
         */
        setShowEmojiPicker(false)
      }
    }

    if (showMenu || showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      /**
       * handleClickOutside - Utility function
       * @returns void
       */
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu, showEmojiPicker])

  const handleEmojiClick = (emojiData: any) => {
    onReact?.(emojiData.emoji)
    setShowEmojiPicker(false)
    setShowMenu(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-full p-1 opacity-0 transition-opacity hover:bg-slate-200 group-hover:opacity-100"
      >
        /** * handleEmojiClick - Utility function * @returns void */
        <MoreVertical className="h-4 w-4 text-slate-500" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker)
              setShowMenu(false)
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Smile className="h-4 w-4" />
            React
          </button>

          {isOwnMessage && (
            <>
              <button
                onClick={() => {
                  onEdit?.()
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>

              <button
                onClick={() => {
                  onDelete?.()
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute right-0 top-full z-50 mt-1">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  )
}
