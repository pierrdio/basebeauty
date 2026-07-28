import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import {
  checkLoginRateLimit,
  getClientIp,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from '@/lib/rate-limit';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

function formatRetryMessage(seconds: number) {
  const minutes = Math.ceil(seconds / 60);
  if (minutes <= 1) {
    return 'Слишком много попыток входа. Попробуйте через 1 минуту.';
  }
  return `Слишком много попыток входа. Попробуйте через ${minutes} мин.`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `login:${ip}`;

    const rateLimit = checkLoginRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: formatRetryMessage(rateLimit.retryAfterSeconds ?? 60),
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds ?? 60),
          },
        }
      );
    }

    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { login },
    });

    const isPasswordValid =
      !!user && (await bcrypt.compare(password, user.password));

    if (!user || !isPasswordValid) {
      const failed = recordFailedLoginAttempt(rateLimitKey);

      if (failed.locked) {
        return NextResponse.json(
          {
            error: formatRetryMessage(failed.retryAfterSeconds ?? 60),
            retryAfterSeconds: failed.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(failed.retryAfterSeconds ?? 60),
            },
          }
        );
      }

      return NextResponse.json(
        {
          error: 'Неверный логин или пароль',
          remainingAttempts: failed.remainingAttempts,
        },
        { status: 401 }
      );
    }

    resetLoginRateLimit(rateLimitKey);

    const token = jwt.sign(
      {
        userId: user.id,
        login: user.login,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
