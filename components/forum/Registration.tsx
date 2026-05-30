"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, User, Mail, Phone, Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Format     = "Offline" | "Online";
type FormStatus = "idle" | "loading" | "success" | "error";
type FieldErrors = {
  firstName?: string;
  lastName?:  string;
  phone?:     string;
  email?:     string;
  format?:    string;
};

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  id, label, type = "text", placeholder, value, onChange,
  icon, disabled, error, autoComplete, required = true,
}: {
  id: string; label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; icon: React.ReactNode;
  disabled: boolean; error?: string; autoComplete?: string; required?: boolean;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1 font-sans text-sm font-medium text-foreground">
        {label}
        {!required && (
          <span className="font-normal text-muted-foreground/60">(необязательно)</span>
        )}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/50"
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full border bg-background py-3 pl-10 pr-4",
            "font-sans text-sm text-foreground placeholder:text-muted-foreground/40",
            "outline-none transition-colors duration-150",
            "focus:border-accent-primary focus-visible:ring-2 focus-visible:ring-accent-primary/30 focus-visible:ring-offset-0",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            error ? "border-red-400 focus:border-red-400" : "border-[#E2E8F0]"
          )}
        />
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 font-sans text-xs text-red-500"
        >
          <AlertCircle className="size-3 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Format picker ────────────────────────────────────────────────────────────

function FormatPicker({
  value, onChange, disabled, error,
}: {
  value: Format | ""; onChange: (v: Format) => void;
  disabled: boolean; error?: string;
}) {
  const options: { value: Format; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      value: "Offline",
      label: "Offline",
      sub: "Технопарк, Бишкек",
      icon: <MapPin className="size-4" />,
    },
    {
      value: "Online",
      label: "Online",
      sub: "Zoom-трансляция",
      icon: <Monitor className="size-4" />,
    },
  ];

  return (
    <div className="space-y-1.5">
      <p className="font-sans text-sm font-medium text-foreground">Формат участия</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              "flex flex-col items-start gap-1 border p-3.5 text-left transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              value === opt.value
                ? "border-accent-primary bg-accent-primary/5"
                : "border-[#E2E8F0] [@media(hover:hover)]:hover:border-accent-primary/40"
            )}
          >
            <span
              className={cn(
                "flex items-center gap-1.5 font-sans text-sm font-semibold",
                value === opt.value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  value === opt.value ? "text-accent-primary" : "text-muted-foreground/50"
                )}
              >
                {opt.icon}
              </span>
              {opt.label}
            </span>
            <span className="font-sans text-[10px] leading-tight text-muted-foreground sm:text-xs">{opt.sub}</span>
          </button>
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 font-sans text-xs text-red-500">
          <AlertCircle className="size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Registration() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-80px" });

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [format,    setFormat]    = useState<Format | "">("");

  const [status,  setStatus]  = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [errors,  setErrors]  = useState<FieldErrors>({});

  // ── Client-side validation ──
  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (firstName.trim().length < 1)    errs.firstName = "Введите имя.";
    if (lastName.trim().length  < 1)    errs.lastName  = "Введите фамилию.";
    if (!/^[\d\s\+\-\(\)]{7,20}$/.test(phone.trim()))
                                         errs.phone     = "Введите корректный номер телефона.";
    if (email.trim() && !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
                                         errs.email     = "Введите корректный email-адрес.";
    if (!format)                         errs.format    = "Выберите формат участия.";
    return errs;
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setErrors({});
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName:  lastName.trim(),
          phone:     phone.trim(),
          email:     email.trim(),
          format,
        }),
      });

      const data: { ok?: boolean; message?: string; error?: string } = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message ?? "Вы успешно зарегистрированы!");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Что-то пошло не так. Попробуйте снова.");
      }
    } catch {
      setStatus("error");
      setMessage("Нет соединения. Проверьте интернет и попробуйте снова.");
    }
  }

  function resetForm() {
    setFirstName(""); setLastName(""); setPhone("");
    setEmail(""); setFormat("");
    setErrors({}); setStatus("idle"); setMessage("");
  }

  const isLoading = status === "loading";

  return (
    <section
      id="registration"
      ref={sectionRef}
      className="bg-background px-4 py-12 md:px-8 md:py-24 lg:py-36"
    >
      <div className="mx-auto max-w-6xl">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-10 md:mb-16"
        >
          <span className="mb-5 block font-sans text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
            Участие
          </span>
          <h2 className="mb-3 max-w-xl font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            Зарегистрируйтесь
          </h2>
          <p className="font-sans text-base text-muted-foreground">
            Заполните форму — мы свяжемся с вами для подтверждения участия.
          </p>
        </motion.div>

        {/* ── Two-column grid ── */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">

          {/* Left — event highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <ul className="space-y-7">
              {[
                {
                  title: "Место проведения",
                  body:  "Технопарк, Бишкек — офлайн + Zoom-трансляция для участников из KG, KZ и UZ",
                },
                {
                  title: "Аудитория",
                  body:  "Школьники и студенты 11–19 лет и их родители",
                },
                {
                  title: "Программа дня",
                  body:  "Блок 1 — Внеклассные активности · Блок 2 — Университеты · Блок 3 — Экзамены (IELTS, SAT и др.)",
                },
                {
                  title: "Конкурсы и призы",
                  body:  "Конкурс эссе, «Принеси мне», Kahoot-викторина и подарки от спонсоров",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-secondary" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — form / success */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
          >

            {status === "success" ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center justify-center gap-5 border border-[#E2E8F0] bg-background-secondary px-8 py-14 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-accent-primary/10">
                  <CheckCircle2 className="size-8 text-accent-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-xl font-semibold text-foreground">
                    Вы зарегистрированы!
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                    {message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-2 font-sans text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  Зарегистрировать другого участника
                </button>
              </div>
            ) : (
              /* ── Registration form ── */
              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5 border border-[#E2E8F0] bg-background-secondary p-4 sm:p-6 lg:p-8"
              >
                {/* First + Last name in a row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    id="reg-firstName"
                    label="Имя"
                    placeholder="Айбек"
                    value={firstName}
                    onChange={(v) => { setFirstName(v); clearError("firstName"); }}
                    icon={<User className="size-4" />}
                    disabled={isLoading}
                    error={errors.firstName}
                    autoComplete="given-name"
                  />
                  <Field
                    id="reg-lastName"
                    label="Фамилия"
                    placeholder="Жолдошев"
                    value={lastName}
                    onChange={(v) => { setLastName(v); clearError("lastName"); }}
                    icon={<User className="size-4" />}
                    disabled={isLoading}
                    error={errors.lastName}
                    autoComplete="family-name"
                  />
                </div>

                <Field
                  id="reg-phone"
                  label="Номер телефона"
                  type="tel"
                  placeholder="+996 700 000 000"
                  value={phone}
                  onChange={(v) => { setPhone(v); clearError("phone"); }}
                  icon={<Phone className="size-4" />}
                  disabled={isLoading}
                  error={errors.phone}
                  autoComplete="tel"
                />

                <Field
                  id="reg-email"
                  label="Email"
                  type="email"
                  placeholder="aibek@example.com"
                  value={email}
                  onChange={(v) => { setEmail(v); clearError("email"); }}
                  icon={<Mail className="size-4" />}
                  disabled={isLoading}
                  error={errors.email}
                  autoComplete="email"
                  required={false}
                />

                <FormatPicker
                  value={format}
                  onChange={(v) => { setFormat(v); clearError("format"); }}
                  disabled={isLoading}
                  error={errors.format}
                />

                {/* Server error banner */}
                {status === "error" && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2.5 border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
                    <p className="font-sans text-sm text-red-600">{message}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "flex w-full items-center justify-center gap-2",
                    "min-h-14 py-3.5 sm:min-h-12",
                    "bg-[#8ECAE6] font-sans text-sm font-semibold text-[#1E293B]",
                    "transition-all duration-200",
                    "[@media(hover:hover)]:hover:bg-[#1E293B] [@media(hover:hover)]:hover:text-[#8ECAE6]",
                    "active:bg-[#1E293B] active:text-[#8ECAE6]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ECAE6]",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    "Зарегистрироваться"
                  )}
                </button>

                <p className="font-sans text-xs leading-relaxed text-muted-foreground/60">
                  Отправляя форму, вы соглашаетесь на обработку персональных данных
                  в соответствии с{" "}
                  <a
                    href="/privacy"
                    className="underline underline-offset-2 transition-colors hover:text-muted-foreground"
                  >
                    политикой конфиденциальности
                  </a>
                  .
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
