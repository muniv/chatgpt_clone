// 더미 파일 - 빌드 에러 방지용
export const getAssistantImageFromStorage = async (filePath?: string) => 'https://via.placeholder.com/150'
export const uploadAssistantImage = async (assistant?: any, image?: File) => 'dummy-image-path-' + Date.now()
export const deleteAssistantImage = async (imageId?: string) => ({ success: true })
