import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import { loginAdmin, isAdminAuthed } from "@/lib/admin-auth";
import { IMG } from "@/lib/site-data";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "تسجيل دخول لوحة التحكم" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) navigate({ to: "/admin", replace: true });
  }, [navigate]);

  const submit = (e: import("react").FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      const ok = loginAdmin(email, password);
      setSubmitting(false);
      if (!ok) {
        setError("بيانات الدخول غير صحيحة أو لا تملك صلاحية الوصول");
        return;
      }
      navigate({ to: "/admin", replace: true });
    }, 300);
  };

  return (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-brand p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-white">
          <img src={IMG.logo} alt="شعار المدرسة" className="h-16 w-16 object-contain mb-3" />
          <div className="font-extrabold text-lg">مدرسة مدحت السويدي</div>
          <div className="text-xs text-white/70">للتكنولوجيا التطبيقية</div>
        </div>
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-[var(--accent-red)]/10 text-[var(--accent-red)] grid place-items-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-brand">تسجيل دخول لوحة التحكم</h1>
                <p className="text-xs text-muted-foreground">للمصرح لهم فقط</p>
              </div>
            </div>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-2">
                <Label className="font-semibold text-brand">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold text-brand">كلمة المرور</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white"
              >
                <Lock className="h-4 w-4 ml-1" />
                {submitting ? "جارٍ الدخول..." : "دخول لوحة التحكم"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
