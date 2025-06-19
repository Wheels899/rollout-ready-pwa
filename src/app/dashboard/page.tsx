import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = await validateSession(token);
  
  if (!user) {
    redirect('/login');
  }

  // Redirect based on user role
  if (user.systemRole === 'ADMIN' || user.systemRole === 'MANAGER') {
    redirect('/admin');
  } else {
    redirect(`/dashboard/${user.username}`);
  }
}
