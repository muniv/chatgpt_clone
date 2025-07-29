// 더미 파일 - 빌드 에러 방지용
export const getAssistantWorkspacesByWorkspaceId = async () => []
export const getAssistantCollectionsByAssistantId = async () => []
export const getAssistantFilesByAssistantId = async () => []
export const getAssistantToolsByAssistantId = async () => []
export const createAssistants = async () => null
export const createAssistant = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const updateAssistant = async (assistantId?: string, data?: any) => ({ id: assistantId || 'dummy', ...data })
export const deleteAssistant = async (assistantId?: string) => ({ success: true })
export const createAssistantWorkspaces = async (data?: any) => ({ success: true })
export const deleteAssistantWorkspace = async (assistantId?: string, workspaceId?: string) => true
export const getAssistantWorkspacesByAssistantId = async (assistantId?: string) => ({ workspaces: [] })
