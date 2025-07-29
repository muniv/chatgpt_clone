// 더미 파일 - 빌드 에러 방지용
export const getPromptWorkspacesByWorkspaceId = async () => []
export const createPrompts = async () => null
export const createPrompt = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const deletePrompt = async (promptId?: string) => ({ success: true })
export const createPromptWorkspaces = async (data?: any) => ({ success: true })
export const deletePromptWorkspace = async (promptId?: string, workspaceId?: string) => true
export const getPromptWorkspacesByPromptId = async (promptId?: string) => ({ workspaces: [] })
export const updatePrompt = async (promptId?: string, data?: any) => ({ id: promptId || 'dummy', ...data })
