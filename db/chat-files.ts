// 더미 파일 - 빌드 에러 방지용
export const getChatFilesByChatId = async (chatId?: string) => ({ 
  id: 'dummy-' + chatId, 
  files: chatId ? [{ 
    id: 'dummy-file-' + chatId, 
    name: 'dummy-file.txt', 
    type: 'text/plain', 
    size: 1024, 
    sharing: 'private' 
  }] : [] 
})
export const createChatFiles = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const deleteChatFile = async (fileId?: string) => ({ success: true })
