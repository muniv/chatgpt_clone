// 더미 파일 - 빌드 에러 방지용
export const getPresetWorkspacesByWorkspaceId = async () => []
export const createPresets = async () => null
export const createPreset = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const deletePreset = async (presetId?: string) => ({ success: true })
export const createPresetWorkspaces = async (data?: any) => ({ success: true })
export const deletePresetWorkspace = async (presetId?: string, workspaceId?: string) => true
export const getPresetWorkspacesByPresetId = async (presetId?: string) => ({ workspaces: [] })
export const updatePreset = async (presetId?: string, data?: any) => ({ id: presetId || 'dummy', ...data })
