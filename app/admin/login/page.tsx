"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Неверный пароль.");
      }
    } catch {
      setError("Ошибка сети. Проверьте соединение.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-sm">
            <Lock className="size-5 text-[#8ECAE6]" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8ECAE6]">
            Grant Circle Central Asia
          </p>
          <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-[#0F172A]">
            Панель управления
          </h1>
          <p className="mt-1 font-sans text-sm text-[#64748B]">
            Введите пароль для доступа
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password field */}
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block font-sans text-xs font-medium uppercase tracking-wide text-[#64748B]"
            >
              Пароль
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                required
                autoFocus
                autoComplete="current-password"
                className="
                  w-full border border-[#E2E8F0] bg-white px-4 py-3 pr-12
                  font-sans text-sm text-[#0F172A] placeholder:text-[#CBD5E1]
                  outline-none transition-colors
                  focus:border-[#8ECAE6]
                  aria-invalid:border-red-400
                "
                aria-invalid={error ? "true" : undefined}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#64748B]"
              >
                {showPw
                  ? <EyeOff className="size-4" aria-hidden />
                  : <Eye    className="size-4" aria-hidden />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="font-sans text-xs text-red-500">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="
              flex h-12 w-full items-center justify-center gap-2
              bg-[#0F172A] font-sans text-sm font-medium text-white
              transition-opacity
              hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            {loading
              ? <Loader2 className="size-4 animate-spin" aria-hidden />
              : "Войти"
            }
          </button>
        </form>
      </div>
    </div>
  );
}
