import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Hash, Box, Loader2 } from "lucide-react";
import { shortHash } from "@/lib/web3-sim";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard Admin — ChainIjazah" }] }),
  component: AdminDashboard,
});

type Ijazah = Tables<"ijazah">;

function AdminDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Ijazah[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("ijazah")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  const filtered = items.filter(
    (i) =>
      !q ||
      i.nama.toLowerCase().includes(q.toLowerCase()) ||
      i.nim.toLowerCase().includes(q.toLowerCase()) ||
      i.cert_id.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola dan terbitkan ijazah ke blockchain.
            </p>
          </div>
          <Link to="/admin/upload">
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> Terbitkan Ijazah
            </Button>
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={FileText} label="Total Ijazah" value={items.length} />
          <StatCard icon={Hash} label="Hash Tersimpan" value={items.length} />
          <StatCard
            icon={Box}
            label="Latest Block"
            value={items[0] ? `#${items[0].block_number.toLocaleString()}` : "—"}
          />
        </div>

        <Card className="bg-card shadow-card">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-display">Ijazah Terdaftar</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / NIM / cert ID"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Belum ada ijazah yang diterbitkan.</p>
                <Link to="/admin/upload" className="mt-3 inline-block text-primary hover:underline">
                  Terbitkan ijazah pertama →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4">Cert ID</th>
                      <th className="py-3 pr-4">Nama</th>
                      <th className="py-3 pr-4">NIM</th>
                      <th className="py-3 pr-4">Jurusan</th>
                      <th className="py-3 pr-4">Tahun</th>
                      <th className="py-3 pr-4">Block</th>
                      <th className="py-3 pr-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <tr key={i.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 pr-4 font-mono text-xs text-primary">{i.cert_id}</td>
                        <td className="py-3 pr-4 font-medium">{i.nama}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{i.nim}</td>
                        <td className="py-3 pr-4">{i.jurusan}</td>
                        <td className="py-3 pr-4">{i.tahun_lulus}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          #{i.block_number.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <Link
                            to="/cert/$certId"
                            params={{ certId: i.cert_id }}
                            className="text-primary hover:underline"
                          >
                            Lihat
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {filtered.length > 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                Tx terakhir: <span className="font-mono">{shortHash(items[0]?.tx_hash ?? "")}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="bg-card shadow-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
