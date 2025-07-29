// 더미 파일 - Supabase 의존성 제거를 위한 서버 사이드 임시 파일

export const createClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        then: async (callback: any) => callback({ data: null, error: null })
      }),
      then: async (callback: any) => callback({ data: [], error: null })
    }),
    insert: async (data: any) => ({ data: null, error: null }),
    update: async (data: any) => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null })
  })
})

export const createServerClient = createClient
