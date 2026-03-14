import { requireUser } from "@/lib/auth/get-user";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, profile } = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <ProfileForm email={user.email} fullName={profile.fullName} />
    </div>
  );
}
