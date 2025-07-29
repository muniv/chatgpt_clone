// 더미 파일 - 빌드 에러 방지용
export const getFileFromStorage = async (filePath?: string) => 'https://dummy-file-url.com/' + (filePath || 'dummy.txt')
export const uploadFile = async (file?: File, metadata?: any) => 'dummy-file-path-' + Date.now()
export const deleteFile = async (fileId?: string) => ({ success: true })
export const deleteFileFromStorage = async (filePath?: string) => ({ success: true })
