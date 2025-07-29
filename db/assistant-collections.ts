// 더미 파일 - 빌드 에러 방지용
export const getAssistantCollectionsByAssistantId = async (assistantId?: string) => ({ 
  collections: assistantId ? [{ id: 'dummy-collection-' + assistantId, name: 'Dummy Collection' }] : [] 
})
export const createAssistantCollection = async (data?: any) => ({ id: 'dummy-' + Date.now(), ...data })
export const createAssistantCollections = async (data?: any) => data?.map((item: any, index: number) => ({ id: 'dummy-' + index, ...item })) || []
export const deleteAssistantCollection = async (assistantId?: string, collectionId?: string) => ({ success: true })
