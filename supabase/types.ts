// 더미 파일 - Supabase 의존성 제거를 위한 임시 타입 정의

export interface Database {
  public: {
    Tables: any
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = any
export type TablesInsert<T extends keyof Database['public']['Tables']> = any
export type TablesUpdate<T extends keyof Database['public']['Tables']> = any
