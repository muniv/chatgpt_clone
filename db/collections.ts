// 더미 파일 - 빌드 에러 방지용
export const getCollectionWorkspacesByWorkspaceId = async () => []
export const getCollectionFilesByCollectionId = async () => []
export const createCollections = async () => null
export const createCollection = async (data?: any, workspaceId?: string) => ({ id: 'dummy-' + Date.now(), ...data })
export const deleteCollection = async (collectionId?: string) => ({ success: true })
export const createCollectionWorkspaces = async (data?: any) => ({ success: true })
export const deleteCollectionWorkspace = async (collectionId?: string, workspaceId?: string) => true
export const getCollectionWorkspacesByCollectionId = async (collectionId?: string) => ({ workspaces: [] })
export const updateCollection = async (collectionId?: string, data?: any) => ({ id: collectionId || 'dummy', ...data })
