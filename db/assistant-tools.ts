// 더미 파일 - 빌드 에러 방지용
export const getAssistantToolsByAssistantId = async (assistantId?: string) => ({ 
  tools: assistantId ? [{ id: 'dummy-tool-' + assistantId, name: 'Dummy Tool' }] : [] 
})
export const createAssistantTool = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const createAssistantTools = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const deleteAssistantTool = async (assistantId?: string, toolId?: string) => ({ success: true })
