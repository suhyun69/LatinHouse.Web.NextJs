import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // 1) 서버 전용 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    if (!fileName) {
      return NextResponse.json({ error: '파일명이 없습니다.' }, { status: 400 })
    }

    const { data, error } = await supabase.storage
      .from('images')
      .upload(`${fileName}`, file, {
        upsert: true // 동일 파일명 있을 경우 덮어쓰기 허용 (원하면 제거 가능)
      })

    if (error) {
      console.error('업로드 오류:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (error) {
    console.error('업로드 오류:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
