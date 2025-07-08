import { supabase } from './supabase'

export const auth = {
  // 使用匿名认证进行临时登录
  async signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Anonymous sign in failed:', error)
      throw error
    }
  },

  // 使用邮箱密码登录（可选）
  async signInWithPassword(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Get user failed:', error)
      return null
    }
  },

  // 登出
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 