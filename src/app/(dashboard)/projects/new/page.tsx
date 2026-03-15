"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { projectSchema } from "@/lib/validations/schemas";

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

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
      toast.success("Project created");
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

      <h1 className="animate-fade-in-up delay-100 mb-6 text-xl font-medium tracking-tight">New Project</h1>

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
