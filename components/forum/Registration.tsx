"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, User, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type FormStatus = "idle" | "loading" | "success" | "error";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  disabled: boolean;
  error?: string;
  autoComplete?: string;
};

function Field({
  id, label, type = "text", placeholder, value, onChange,
  icon, disabled, error, autoComplete,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-sans text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
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
          className={cn(
            "w-full border bg-background py-3 pl-10 pr-4",
            "font-sans text-sm text-foreground placeholder:text-muted-foreground/50",
            "outline-none transition-colors duration-150",
            "focus:border-accent-primary",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            error ? "border-red-400" : "border-[#E2E8F0]"
          )}
        />
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

export function Registration() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status,  setStatus]  = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [errors,  setErrors]  = useState<{ name?: string; email?: string; phone?: string }>({});

  function validate() {
    const errs: typeof errors = {};
    if (name.trim().length < 2)
      errs.name = "Введите имя (минимум 2 символа).";
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
      errs.email = "Введите корректный email-адрес.";
    if (!/^[\d\s\+\-\(\)]{7,20}$/.test(phone.trim()))
      errs.phone = "Введите корректный номер телефона.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data: { ok?: boolean; message?: string; error?: string } = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message ?? "Регистрация прошла успешно!");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Что-то пошло не так. Попробуйте снова.");
      }
    } catch {
      setStatus("error");
      setMessage("Нет соединения. Проверьте интернет и попробуйте снова.");
    }
  }

  function clearError(field: keyof typeof errors) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  const isLoading = status === "loading";

  return (
    <section
      id="registration"
      ref={sectionRef}
      className="bg-background px-4 py-12 md:px-8 md:py-24 lg:py-36"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
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

        {/* Two-column layout */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">

          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <ul className="space-y-6">
              {[
                {
                  title: "Место проведения",
                  body: "Технопарк, Бишкек",
                },
                {
                  title: "Формат",
                  body: "Офлайн + Zoom-трансляция для участников из KG, KZ и UZ",
                },
                {
                  title: "Аудитория",
                  body: "Школьники и студенты 11–19 лет, а также их родители",
                },
                {
                  title: "Что ждёт",
                  body: "3 тематических блока, конкурсы с призами, нетворкинг и панельная дискуссия с все спикерами",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-secondary" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 font-sans text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
          >
            {status === "success" ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center justify-center gap-5 border border-[#E2E8F0] bg-background-secondary px-8 py-14 text-center">
                <CheckCircle2 className="size-12 text-accent-primary" strokeWidth={1.5} />
                <div>
                  <p className="font-sans text-lg font-semibold text-foreground">
                    Вы зарегистрированы!
                  </p>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted-foreground">
                    {message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setName(""); setEmail(""); setPhone("");
                  }}
                  className="font-sans text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  Зарегистрировать другого участника
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form
                onSubmit={handleSubmit}
                noValidate
                className="border border-[#E2E8F0] bg-background-secondary p-6 sm:p-8"
              >
                <div className="space-y-5">
                  <Field
                    id="reg-name"
                    label="Имя и фамилия"
                    placeholder="Айбек Жолдошев"
                    value={name}
                    onChange={(v) => { setName(v); clearError("name"); }}
                    icon={<User className="size-4" />}
                    disabled={isLoading}
                    error={errors.name}
                    autoComplete="name"
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
                  />
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
                </div>

                {/* Server-level error */}
                {status === "error" && (
                  <p className="mt-4 flex items-center gap-2 font-sans text-sm text-red-500">
                    <AlertCircle className="size-4 shrink-0" />
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "mt-6 flex w-full items-center justify-center gap-2",
                    "bg-[#8ECAE6] py-3.5 font-sans text-sm font-semibold text-[#1E293B]",
                    "transition-all duration-200",
                    "hover:bg-[#1E293B] hover:text-[#8ECAE6]",
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

                <p className="mt-4 font-sans text-xs leading-relaxed text-muted-foreground/70">
                  Отправляя форму, вы соглашаетесь на обработку персональных данных в соответствии
                  с{" "}
                  <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
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
