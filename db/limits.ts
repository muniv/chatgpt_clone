// 더미 파일 - 빌드 에러 방지용
export const getLimitsByUserId = async (userId?: string) => null
export const incrementProfileUsage = async (userId?: string, usage?: number) => null
export const resetProfileUsage = async (userId?: string) => null
export const checkUsageLimit = async (userId?: string, limit?: number) => true

// Profile limits constants
export const PROFILE_DISPLAY_NAME_MAX = 100
export const PROFILE_USERNAME_MAX = 25
export const PROFILE_USERNAME_MIN = 3
export const ASSISTANT_DESCRIPTION_MAX = 500
export const ASSISTANT_NAME_MAX = 100
export const COLLECTION_DESCRIPTION_MAX = 500
export const COLLECTION_NAME_MAX = 100
export const FILE_DESCRIPTION_MAX = 500
export const FILE_NAME_MAX = 100
export const checkApiKey = async (apiKey?: string) => ({ isValid: true })
export const checkLimitsForWorkspace = async (workspaceId?: string) => ({ canCreate: true })
export const checkLimitsForUser = async (userId?: string) => ({ canCreate: true })
export const checkLimitsForChat = async (userId?: string, chatId?: string) => ({ canCreate: true })
export const checkLimitsForMessage = async (userId?: string) => ({ canCreate: true })
