// 더미 파일 - 빌드 에러 방지용
export const getCollectionFilesByCollectionId = async (collectionId?: string) => ({ 
  files: collectionId ? [{ id: 'dummy-file-' + collectionId, name: 'dummy.txt', type: 'text/plain', size: 1024 }] : [] 
})
export const createCollectionFile = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const createCollectionFiles = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const deleteCollectionFile = async (collectionId?: string, fileId?: string) => ({ success: true })
