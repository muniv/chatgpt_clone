// 더미 파일 - 빌드 에러 방지용
export const getToolWorkspacesByWorkspaceId = async () => []
export const createTools = async () => null
export const createTool = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const deleteTool = async (toolId?: string) => ({ success: true })
export const createToolWorkspaces = async (data?: any) => ({ success: true })
export const deleteToolWorkspace = async (toolId?: string, workspaceId?: string) => true
export const getToolWorkspacesByToolId = async (toolId?: string) => ({ workspaces: [] })
export const updateTool = async (toolId?: string, data?: any) => ({ id: toolId || 'dummy', ...data })
