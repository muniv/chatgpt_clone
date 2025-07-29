// 더미 파일 - 빌드 에러 방지용
export const getChatsByWorkspaceId = async (workspaceId?: string) => []
export const updateChat = async (chatId?: string, data?: any) => ({ id: 'dummy', ...data })
export const getChatFilesByChatId = async (chatId?: string) => []
export const getChatById = async (chatId?: string) => ({ 
  id: chatId || 'dummy', 
  name: 'Dummy Chat', 
  assistant_id: null, 
  model: 'gpt-4', 
  prompt: '', 
  temperature: 0.7, 
  context_length: 4000, 
  include_profile_context: true, 
  include_workspace_instructions: true, 
  embeddings_provider: 'openai' 
})
export const createChat = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const createChats = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const deleteChat = async (chatId?: string) => ({ success: true })
