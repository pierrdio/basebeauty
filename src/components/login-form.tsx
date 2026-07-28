'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";

function formatLockMessage(seconds: number) {
  const minutes = Math.ceil(seconds / 60);
  if (minutes <= 1) {
    return "Слишком много попыток. Повторите через 1 минуту.";
  }
  return `Слишком много попыток. Повторите через ${minutes} мин.`;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const router = useRouter();

  const isLocked = lockedUntil !== null && remainingSeconds > 0;

  useEffect(() => {
    if (!lockedUntil) return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left <= 0) {
        setLockedUntil(null);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const applyLock = (retryAfterSeconds?: number) => {
    const seconds = retryAfterSeconds ?? 60;
    setLockedUntil(Date.now() + seconds * 1000);
    setRemainingSeconds(seconds);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) {
      toast.error(formatLockMessage(remainingSeconds));
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Успешный вход в систему');
        router.push('/dashboard');
      } else if (response.status === 429) {
        applyLock(data.retryAfterSeconds);
        toast.error(data.error || formatLockMessage(data.retryAfterSeconds ?? 60));
      } else {
        const hint =
          typeof data.remainingAttempts === 'number'
            ? ` Осталось попыток: ${data.remainingAttempts}.`
            : '';
        toast.error((data.error || 'Ошибка входа') + hint);
      }
    } catch (error) {
      console.error('LoginForm - Network error:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 font-onest", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>
            {isLocked
              ? formatLockMessage(remainingSeconds)
              : "Введите логин и пароль для входа в систему"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  name="login"
                  type="text"
                  placeholder="Введите логин"
                  required
                  disabled={isLoading || isLocked}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Пароль</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Введите пароль"
                  required
                  disabled={isLoading || isLocked}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isLocked}
                >
                  {isLocked
                    ? `Подождите ${remainingSeconds} сек.`
                    : isLoading
                      ? 'Вход...'
                      : 'Войти'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
