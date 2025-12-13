import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    console.log('Login attempt:', { login, passwordProvided: !!password });

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    // Найти пользователя в базе
    const user = await prisma.user.findUnique({
      where: { login }
    });

    console.log('User found:', !!user, user ? { id: user.id, login: user.login } : null);

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    // Проверить пароль
    console.log('Checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    // Создать JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        login: user.login 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', user.login);

    // Установить токен в HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        login: user.login
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: false, // Временно отключаем для отладки
      secure: false,   // Временно отключаем для localhost
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 часа
    });

    console.log('Cookie set with token:', token.substring(0, 20) + '...');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
