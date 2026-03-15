"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import Link from "next/link";
import { ArrowLeft, Upload, ChevronDown, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { createProjectSchema } from "@/lib/validations/schemas";

type ProjectFormData = z.infer<typeof createProjectSchema>;

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;

function parsePreview(content: string) {
  const keys: string[] = [];
  const invalid: string[] = [];

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      invalid.push(line.slice(0, 40));
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    if (KEY_PATTERN.test(key)) {
      keys.push(key);
    } else {
      invalid.push(key);
    }
  }

  return { keys, invalid };
}

const ENV_OPTIONS = [
  { value: "development", label: "Development" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
] as const;

export default function NewProjectPage() {
  const router = useRouter();
  const [showImport, setShowImport] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      targetEnvironment: "development",
      treatAsSecrets: false,
    },
  });

  const envContent = watch("envContent");
  const treatAsSecrets = watch("treatAsSecrets");
  const targetEnvironment = watch("targetEnvironment");

  const preview = useMemo(
    () => (envContent?.trim() ? parsePreview(envContent) : null),
    [envContent],
  );

  async function onSubmit(data: ProjectFormData) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to create project");
      }

      const project = await res.json();

      if (preview && preview.keys.length > 0) {
        toast.success(
          `Project created with ${preview.keys.length} config entries imported`,
        );
      } else {
        toast.success("Project created");
      }

      router.push(`/projects/${project.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }

  return (
    <div className="max-w-lg">
      <Link
        href="/projects"
        className="animate-fade-in mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <h1 className="animate-fade-in-up delay-100 mb-6 text-xl font-medium tracking-tight">
        New Project
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project name</Label>
          <Input id="name" placeholder="My Project" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What is this project about?"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Bulk .env import section */}
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            <span className="inline-flex items-center gap-2">
              <Upload className="size-4 text-muted-foreground" />
              Import .env file
              {preview && preview.keys.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {preview.keys.length} key{preview.keys.length !== 1 && "s"}
                </Badge>
              )}
            </span>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${showImport ? "rotate-180" : ""}`}
            />
          </button>

          {showImport && (
            <div className="space-y-4 border-t px-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="env-content">Environment variables</Label>
                <p className="text-xs text-muted-foreground">
                  Paste your .env file contents. Each line should be KEY=value
                  format.
                </p>
                <Textarea
                  id="env-content"
                  placeholder={"DATABASE_URL=postgres://...\nAPI_KEY=sk-...\nNODE_ENV=production"}
                  className="min-h-[140px] font-mono text-sm"
                  {...register("envContent")}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <Label htmlFor="target-env" className="text-xs">
                    Import to environment
                  </Label>
                  <div className="flex gap-1.5">
                    {ENV_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("targetEnvironment", opt.value)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          targetEnvironment === opt.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="treat-secrets"
                    checked={treatAsSecrets}
                    onCheckedChange={(v) => setValue("treatAsSecrets", v)}
                  />
                  <Label htmlFor="treat-secrets" className="text-xs">
                    Treat as secrets
                  </Label>
                </div>
              </div>

              {preview && preview.keys.length > 0 && (
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Preview — {preview.keys.length} key
                    {preview.keys.length !== 1 && "s"} detected
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.keys.map((key) => (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="font-mono text-xs"
                      >
                        {key}
                      </Badge>
                    ))}
                  </div>
                  {preview.invalid.length > 0 && (
                    <p className="mt-2 text-xs text-destructive">
                      <FileWarning className="mr-1 inline size-3" />
                      {preview.invalid.length} invalid line
                      {preview.invalid.length !== 1 && "s"} will be skipped
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating\u2026" : "Create project"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/projects")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
