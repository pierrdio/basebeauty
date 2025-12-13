import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    // Найти и удалить существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { login }
    });

    if (existingUser) {
      console.log('Deleting existing user:', login);
      await prisma.user.delete({
        where: { login }
      });
    }

    // Хешировать пароль
    console.log('Hashing new password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Создать нового пользователя
    const user = await prisma.user.create({
      data: {
        login,
        password: hashedPassword
      }
    });

    console.log('User created:', { id: user.id, login: user.login });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно сброшен и создан заново',
      user: {
        id: user.id,
        login: user.login
      }
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
