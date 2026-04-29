import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut } from "lucide-react";

export function SiteHeader() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Chain<span className="text-gradient">Ijazah</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/verify"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Verifikasi
          </Link>
          {email ? (
            <>
              <Link
                to="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" /> Keluar
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                Login Admin
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
