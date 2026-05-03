import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Smile, X, Image as ImageIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@shared/components/ui/button'

/**
 * EmojiPicker - React component
 * @returns React element
 */
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

type MessageComposerProps = {
  onSend: (content: string, mediaUrl?: string) => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  onFileUpload?: (file: File) => Promise<
    | string
    | {
      url: string
      filename?: string
      type?: string
      isImage?: boolean
      isVideo?: boolean
    }
  >
  disabled?: boolean
  placeholder?: string
}

export const MessageComposer = ({
  onSend,
  onTypingStart,
/**
 * MessageComposer - React component
 * @returns React element
 */
  onTypingStop,
  onFileUpload,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageComposerProps) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    name: string
    type?: string
    isImage?: boolean
    isVideo?: boolean
  } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (value: string) => {
    setMessage(value)
/**
 * textareaRef - Utility function
 * @returns void
 */

    if (value.trim() && !isTyping) {
      setIsTyping(true)
      onTypingStart?.()
/**
 * fileInputRef - Utility function
 * @returns void
 */
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
/**
 * typingTimeoutRef - Utility function
 * @returns void
 */
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
/**
 * handleChange - Utility function
 * @returns void
 */
        onTypingStop?.()
      }
    }, 1000)
  }

  const handleSend = () => {
    const trimmedMessage = message.trim()

    if ((!trimmedMessage && !uploadedFile) || disabled) {
      return
    }

    onSend(trimmedMessage, uploadedFile?.url)
    setMessage('')
    setUploadedFile(null)
    setIsTyping(false)
    setShowEmojiPicker(false)
    onTypingStop?.()

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

/**
 * handleSend - Utility function
 * @returns void
 */
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }
/**
 * trimmedMessage - Utility function
 * @returns void
 */

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onFileUpload) return

    setIsUploading(true)
    try {
      const response = await onFileUpload(file)
      const url = typeof response === 'string' ? response : response.url
      const fileType = typeof response === 'object' ? response.type : undefined
      const isImage = typeof response === 'object' ? response.isImage : file.type.startsWith('image/')
      const isVideo = typeof response === 'object' ? response.isVideo : file.type.startsWith('video/')

      setUploadedFile({
        url,
        name: file.name,
        type: fileType,
        isImage,
        isVideo,
      })
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
/**
 * handleFileSelect - Utility function
 * @returns void
 */
        fileInputRef.current.value = ''
      }
    }
  }
/**
 * file - Utility function
 * @returns void
 */

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const handleEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji
    const textarea = textareaRef.current
/**
 * response - Utility function
 * @returns void
 */
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
/**
 * url - Utility function
 * @returns void
 */
    const newValue = message.substring(0, start) + emoji + message.substring(end)

    setMessage(newValue)
    setTimeout(() => {
      textarea.focus()
/**
 * isImage - Utility function
 * @returns void
 */
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

/**
 * isVideo - Utility function
 * @returns void
 */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const maxHeight = 120
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      {uploadedFile && (
        <div className="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          {uploadedFile.isImage ? (
/**
 * handleRemoveFile - Utility function
 * @returns void
 */
            <div className="relative">
              <img
                src={uploadedFile.url}
                alt={uploadedFile.name}
                className="max-h-48 w-full rounded-lg object-contain"
                onError={(e) => {
                  // Fallback if image fails to load
/**
 * handleEmojiClick - Utility function
 * @returns void
 */
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
/**
 * emoji - Utility function
 * @returns void
 */
              />
              <div className="hidden flex items-center gap-2 px-3 py-2">
                <ImageIcon className="h-4 w-4 text-slate-500" />
                <span className="flex-1 truncate text-sm text-slate-700">{uploadedFile.name}</span>
/**
 * textarea - Utility function
 * @returns void
 */
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              >
/**
 * start - Utility function
 * @returns void
 */
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : uploadedFile.isVideo ? (
/**
 * end - Utility function
 * @returns void
 */
            <div className="relative">
              <video
                src={uploadedFile.url}
                className="max-h-48 w-full rounded-lg"
/**
 * newValue - Utility function
 * @returns void
 */
                controls
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1">
/**
 * handleKeyDown - Utility function
 * @returns void
 */
              <ImageIcon className="h-4 w-4 text-slate-500" />
              <span className="flex-1 truncate text-sm text-slate-700">{uploadedFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
/**
 * adjustTextareaHeight - Utility function
 * @returns void
 */
          )}
        </div>
      )}

/**
 * textarea - Utility function
 * @returns void
 */
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
/**
 * maxHeight - Utility function
 * @returns void
 */
        />
        <button
          type="button"
          disabled={disabled || isUploading}
/**
 * newHeight - Utility function
 * @returns void
 */
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              handleChange(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
/**
 * target - Utility function
 * @returns void
 */
            style={{
              minHeight: '40px',
              maxHeight: '120px',
            }}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <Smile className="h-5 w-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || isUploading || (!message.trim() && !uploadedFile)}
          size="lg"
          className="shrink-0 rounded-full px-4"
        >
          {isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Press Enter to send, Shift + Enter for new line
      </div>
    </div>
  )
}
