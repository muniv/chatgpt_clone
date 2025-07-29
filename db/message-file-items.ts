// 더미 파일 - 빌드 에러 방지용
export const getMessageFileItemsByMessageId = async (messageId?: string) => ({ 
  id: 'dummy-' + messageId, 
  file_items: messageId ? [{ 
    id: 'dummy-file-item-' + messageId, 
    name: 'dummy-file.txt', 
    type: 'text/plain', 
    size: 1024 
  }] : [] 
})
export const createMessageFileItems = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const deleteMessageFileItem = async (itemId?: string) => ({ success: true })
