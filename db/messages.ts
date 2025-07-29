// 더미 파일 - 빌드 에러 방지용
export const getMessagesByChatId = async (chatId?: string) => 
  chatId ? [{ 
    id: 'dummy-message-' + chatId, 
    content: 'Dummy message', 
    image_paths: [], 
    role: 'user', 
    created_at: new Date().toISOString() 
  }] : []
export const deleteMessagesIncludingAndAfter = async (userId?: string, chatId?: string, sequenceNumber?: number) => ({ success: true })
export const createMessages = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const updateMessage = async (messageId?: string, data?: any) => ({ id: messageId || 'dummy', ...data })
export const deleteMessage = async (messageId?: string) => ({ success: true })
