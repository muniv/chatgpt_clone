// 더미 파일 - 빌드 에러 방지용
export const getModelWorkspacesByWorkspaceId = async () => []
export const createModel = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const deleteModel = async (modelId?: string) => ({ success: true })
export const createModelWorkspaces = async (data?: any) => ({ success: true })
export const deleteModelWorkspace = async (modelId?: string, workspaceId?: string) => true
export const getModelWorkspacesByModelId = async (modelId?: string) => ({ workspaces: [] })
export const updateModel = async (modelId?: string, data?: any) => ({ id: modelId || 'dummy', ...data })
