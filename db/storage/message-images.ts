// 더미 파일 - 빌드 에러 방지용
export const getMessageImageFromStorage = async (path?: string) => 'https://via.placeholder.com/150'
export const uploadMessageImage = async (filePath?: string, file?: File) => 'dummy-url-' + Date.now()
export const deleteMessageImage = async (imageId?: string) => ({ success: true })
