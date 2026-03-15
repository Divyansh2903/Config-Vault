"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetValues = z.infer<typeof formSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  const password = watch("password");
  const passwordLength = password?.length ?? 0;

  if (!token) {
    return (
      <Card className="w-full border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <p className="font-display text-lg font-semibold tracking-tight">
            Invalid reset link
          </p>
          <p className="text-center text-[13px] text-muted-foreground">
            This password reset link is missing or malformed.
          </p>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-4">
          <Link
            href="/forgot-password"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  async function onSubmit(data: ResetValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(body.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
        <CardHeader className="space-y-1.5 pb-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight">
            Password reset
          </CardTitle>
          <CardDescription className="text-[13px]">
            Your password has been updated. You can now sign in with your new
            password.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Button
            className="h-10 w-full gap-2 text-[13px] font-semibold shadow-md shadow-primary/10"
            onClick={() => router.push("/login")}
          >
            Sign in
            <ArrowRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
      <CardHeader className="space-y-1.5 pb-2 text-center">
        <CardTitle className="font-display text-2xl font-bold tracking-tight">
          Set new password
        </CardTitle>
        <CardDescription className="text-[13px]">
          Choose a strong password for your account
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[13px]">
              New password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                autoFocus
                className="h-10 pr-10"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : passwordLength > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex h-1 flex-1 gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordLength >= level * 4
                          ? passwordLength >= 12
                            ? "bg-emerald-500"
                            : passwordLength >= 8
                              ? "bg-amber-500"
                              : "bg-red-400"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {passwordLength < 8
                    ? "Too short"
                    : passwordLength < 12
                      ? "Good"
                      : "Strong"}
                </span>
              </div>
            ) : null}
          </div>

          <Button
            type="submit"
            className="mt-1 h-10 w-full gap-2 text-[13px] font-semibold shadow-md shadow-primary/10"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset password
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/40 pt-4">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="size-3" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
