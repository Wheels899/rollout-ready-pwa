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

  console.log('Dashboard redirect - User:', user.username, 'Role:', user.systemRole);

  // Force redirect based on user role - ADMIN must go to admin panel
  if (user.systemRole === 'ADMIN') {
    console.log('Redirecting ADMIN user to /admin');
    redirect('/admin');
  } else if (user.systemRole === 'MANAGER') {
    console.log('Redirecting MANAGER user to /admin');
    redirect('/admin');
  } else {
    console.log('Redirecting USER to user dashboard');
    redirect(`/dashboard/${user.username}`);
  }
}
