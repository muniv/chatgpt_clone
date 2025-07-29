// 더미 파일 - 빌드 에러 방지용
export const getAssistantFilesByAssistantId = async (assistantId?: string) => ({ 
  files: assistantId ? [{ id: 'dummy-file-' + assistantId, name: 'dummy.txt', type: 'text/plain', size: 1024 }] : [] 
})
export const createAssistantFile = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const createAssistantFiles = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const deleteAssistantFile = async (assistantId?: string, fileId?: string) => ({ success: true })
