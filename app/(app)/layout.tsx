import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { LightLeak } from "@/components/shared/GlassCard";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch user data for sidebar/header
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { streak: true, xp: true, plan: true },
  }).catch(() => null);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Ambient background orbs */}
      <LightLeak color="blue" size="lg" className="top-20 left-[300px] fixed" />
      <LightLeak color="purple" size="lg" className="bottom-10 right-10 fixed" />

      {/* Sidebar */}
      <AppSidebar streak={user?.streak ?? 0} plan={user?.plan ?? "FREE"} />

      {/* Main Content */}
      <main className="md:ml-[280px] flex-1 flex flex-col min-h-screen">
        {/* Sticky Top Bar */}
        <AppHeader streak={user?.streak ?? 0} xp={user?.xp ?? 0} />

        {/* Page Content */}
        <div className="flex-1 pb-20 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
