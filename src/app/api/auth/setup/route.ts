import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    console.log('Setup attempt:', { login, passwordProvided: !!password });

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    // Проверить существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { login }
    });

    console.log('Existing user:', !!existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким логином уже существует' },
        { status: 400 }
      );
    }

    // Хешировать пароль
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Создать пользователя
    const user = await prisma.user.create({
      data: {
        login,
        password: hashedPassword
      }
    });

    console.log('User created:', { id: user.id, login: user.login });

    return NextResponse.json({
      success: true,
      message: 'Администратор успешно создан',
      user: {
        id: user.id,
        login: user.login
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
