import { getCurrentUser } from "@/lib/auth/current-user";
import { GuestLanding } from "@/features/home/guest-landing";
import { UserDashboard } from "@/features/home/user-dashboard";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    return <UserDashboard currentUser={currentUser} />;
  }

  return <GuestLanding />;
}
