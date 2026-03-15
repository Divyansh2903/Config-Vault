"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations/schemas";
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

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Something went wrong.");
        return;
      }

      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border-border/60 shadow-xl shadow-black/[0.04] dark:shadow-black/25">
      {!sent ? (
        <>
          <CardHeader className="space-y-1.5 pb-2 text-center">
            <CardTitle className="font-display text-2xl font-bold tracking-tight">
              Reset your password
            </CardTitle>
            <CardDescription className="text-[13px]">
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[13px]">
                  Email address
                </Label>
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
                  <p className="text-xs text-destructive">
                    {errors.email.message}
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="size-3.5" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="space-y-1.5 pb-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-6 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl font-bold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription className="text-[13px]">
              If an account exists for{" "}
              <span className="font-medium text-foreground">
                {getValues("email")}
              </span>
              , we&apos;ve sent a password reset link. It expires in 15 minutes.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <Button
              variant="outline"
              className="h-10 w-full gap-2 text-[13px]"
              onClick={() => setSent(false)}
            >
              Didn&apos;t receive it? Try again
            </Button>
          </CardContent>
        </>
      )}

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
