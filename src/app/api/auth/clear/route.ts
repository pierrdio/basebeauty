import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Сессия очищена для тестирования'
    });

    // Очистить все cookie
    response.cookies.set('auth-token', '', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Clear session error:', error);
    return NextResponse.json(
      { error: 'Ошибка очистки сессии' },
      { status: 500 }
    );
  }
}
