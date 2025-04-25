import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // 변경

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // 미들웨어용 클라이언트 생성
  const supabase = createMiddlewareClient({ req, res })
  
  // 세션 새로고침
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}