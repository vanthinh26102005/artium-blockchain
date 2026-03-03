import { MessageCircle } from 'lucide-react'
import { Metadata } from '@/components/SEO/Metadata'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { ConversationsList } from '../components/ConversationsList'
import { EnhancedChatWindow } from '../components/EnhancedChatWindow'
import { MessageComposer } from '../components/MessageComposer'
import { SearchBar } from '../components/SearchBar'
import { useMessaging } from '../hooks/useMessaging'
import { messagingWs } from '@shared/services/websocketClient'
import messagingApis from '@shared/apis/messagingApis'
import { useState } from 'react'

export const MessagingView = () => {
  const user = useAuthStore((state) => state.user)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    conversations,
    selectedConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    typingUsers,
    error,
    selectConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    reactToMessage,
  } = useMessaging()

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = async (content: string, mediaUrl?: string) => {
    if (selectedConversationId) {
      await sendMessage(selectedConversationId, content, mediaUrl)
    }
  }

  const handleFileUpload = async (file: File) => {
    const response = await messagingApis.uploadFile(file)
    return response
  }

  const handleEditMessage = async (messageId: string, content: string) => {
    if (updateMessage) {
      await updateMessage(messageId, content)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (deleteMessage) {
      await deleteMessage(messageId)
    }
  }

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    if (reactToMessage) {
      await reactToMessage(messageId, emoji)
    }
  }

  const handleTypingStart = () => {
    if (selectedConversationId) {
      messagingWs.startTyping(selectedConversationId)
    }
  }

  const handleTypingStop = () => {
    if (selectedConversationId) {
      messagingWs.stopTyping(selectedConversationId)
    }
  }

  return (
    <>
      <Metadata title="Messages | Artium" />

      <div className="-mx-6 -my-1 h-[calc(100vh-120px)] sm:-mx-8 lg:-mx-12">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold leading-[120%] text-slate-900">Messages</h1>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-6 lg:mx-8">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="flex h-[calc(100%-80px)]">
          {/* Conversations List */}
          <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white">
            {/* Search */}
            <div className="border-b border-slate-200 p-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* List */}
            <ConversationsList
              conversations={filteredConversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={selectConversation}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col bg-slate-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                      {selectedConversation.imageUrl ? (
                        <img
                          src={selectedConversation.imageUrl}
                          alt={selectedConversation.name || 'Conversation'}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <MessageCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        {selectedConversation.name || 'Conversation'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {selectedConversation.messageCount} message
                        {selectedConversation.messageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <EnhancedChatWindow
                    messages={messages}
                    currentUserId={user?.id || ''}
                    isLoading={isLoadingMessages}
                    typingUsers={typingUsers}
                    onEditMessage={handleEditMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onReactToMessage={handleReactToMessage}
                  />
                </div>

                {/* Composer */}
                <MessageComposer
                  onSend={handleSendMessage}
                  onFileUpload={handleFileUpload}
                  onTypingStart={handleTypingStart}
                  onTypingStop={handleTypingStop}
                />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="rounded-full bg-slate-200 p-6">
                  <MessageCircle className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-700">
                  Select a conversation
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
