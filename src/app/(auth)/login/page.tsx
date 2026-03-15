"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { loginSchema } from "@/lib/validations/schemas";
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

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.error ?? "Invalid email or password.";
        toast.error(message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
      <CardHeader className="space-y-1.5 pb-2 text-center">
        <CardTitle className="font-display text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-[13px]">
          Sign in to your ConfigVault account
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[13px]">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="h-10"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[13px]">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[12px] text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
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
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="mt-1 h-10 w-full gap-2 text-[13px] font-semibold shadow-md shadow-primary/10"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/40 pt-4">
        <p className="text-[13px] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary transition-colors hover:text-primary/80">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
