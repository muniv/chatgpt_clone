// 더미 파일 - 빌드 에러 방지용
export const getFileWorkspacesByWorkspaceId = async (workspaceId?: string) => []
export const createFiles = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const createFile = async (file?: File, metadata?: any, options?: any, extra?: any) => ({ id: 'dummy-' + Date.now(), name: file?.name || 'dummy.txt', type: file?.type || 'text/plain', size: file?.size || 1024 })
export const createDocXFile = async (value?: any, file?: File, metadata?: any, options?: any, extra?: any) => ({ id: 'dummy-' + Date.now(), name: file?.name || 'dummy.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
export const createFileBasedOnExtension = async (file?: File, metadata?: any, workspaceId?: string, embeddingsProvider?: string) => ({ id: 'dummy-' + Date.now(), name: file?.name || 'dummy.txt', type: file?.type || 'text/plain', size: file?.size || 1024 })
export const deleteFile = async (fileId?: string) => ({ success: true })
export const createFileWorkspaces = async (data?: any) => ({ success: true })
export const deleteFileWorkspace = async (fileId?: string, workspaceId?: string) => true
export const getFileWorkspacesByFileId = async (fileId?: string) => ({ workspaces: [] })
export const updateFile = async (fileId?: string, data?: any) => ({ id: fileId || 'dummy', ...data })
