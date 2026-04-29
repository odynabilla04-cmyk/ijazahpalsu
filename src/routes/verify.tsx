import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Search, Upload, ShieldCheck, ShieldAlert } from "lucide-react";
import { sha256OfFile, shortHash } from "@/lib/web3-sim";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verifikasi Ijazah — ChainIjazah" },
      {
        name: "description",
        content:
          "Cek keaslian ijazah dengan upload ulang PDF atau masukkan ID sertifikat / hash.",
      },
    ],
  }),
  component: VerifyPage,
});

type Ijazah = Tables<"ijazah">;
type Result = { kind: "valid"; data: Ijazah } | { kind: "invalid"; reason: string } | null;

function VerifyPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

  async function verifyByQuery(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const q = query.trim();
      const { data } = await supabase
        .from("ijazah")
        .select("*")
        .or(`cert_id.eq.${q},file_hash.eq.${q.startsWith("0x") ? q : "0x" + q}`)
        .maybeSingle();
      if (data) setResult({ kind: "valid", data });
      else setResult({ kind: "invalid", reason: "Cert ID / hash tidak ditemukan di chain." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal verifikasi";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function verifyByFile(file: File) {
    setBusy(true);
    setResult(null);
    try {
      const hash = await sha256OfFile(file);
      const { data } = await supabase
        .from("ijazah")
        .select("*")
        .eq("file_hash", hash)
        .maybeSingle();
      if (data) setResult({ kind: "valid", data });
      else
        setResult({
          kind: "invalid",
          reason: `Hash file (${shortHash(hash)}) tidak terdaftar. Ijazah mungkin palsu atau telah diubah.`,
        });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal hash file";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Verifikasi Ijazah</h1>
          <p className="mt-2 text-muted-foreground">
            Pilih cara verifikasi: scan / input ID sertifikat, atau upload ulang file PDF.
          </p>
        </div>

        <Card className="bg-card shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Mulai verifikasi</CardTitle>
            <CardDescription>
              Sistem akan mencocokkan data dengan hash di blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="id">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="id">
                  <Search className="mr-2 h-4 w-4" /> Cert ID / Hash
                </TabsTrigger>
                <TabsTrigger value="file">
                  <Upload className="mr-2 h-4 w-4" /> Upload PDF
                </TabsTrigger>
              </TabsList>

              <TabsContent value="id" className="mt-5">
                <form onSubmit={verifyByQuery} className="flex gap-2">
                  <Input
                    placeholder="IJZ-XXXX-XXXXXX  atau  0x..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    type="submit"
                    disabled={busy}
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cek"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="file" className="mt-5 space-y-3">
                <Label htmlFor="vfile">Upload ulang file PDF ijazah</Label>
                <Input
                  id="vfile"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) verifyByFile(f);
                  }}
                />
                {busy && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Menghitung hash & mencocokkan…
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {result?.kind === "valid" && (
          <Card className="mt-6 border-primary/40 bg-card shadow-glow">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
                <span className="font-display text-lg font-semibold">Ijazah ASLI & terverifikasi</span>
              </div>
              <dl className="grid gap-2 text-sm">
                <Row label="Nama" value={result.data.nama} />
                <Row label="NIM" value={result.data.nim} />
                <Row label="Jurusan" value={result.data.jurusan} />
                <Row label="Tahun Lulus" value={String(result.data.tahun_lulus)} />
                <Row label="Cert ID" value={result.data.cert_id} mono />
                <Row label="Hash" value={shortHash(result.data.file_hash, 8)} mono />
                <Row label="Block" value={`#${result.data.block_number.toLocaleString()}`} mono />
              </dl>
              <Button
                className="mt-5 w-full"
                variant="outline"
                onClick={() => navigate({ to: "/cert/$certId", params: { certId: result.data.cert_id } })}
              >
                Lihat detail lengkap
              </Button>
            </CardContent>
          </Card>
        )}

        {result?.kind === "invalid" && (
          <Card className="mt-6 border-destructive/40 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive">
                <ShieldAlert className="h-6 w-6" />
                <span className="font-display text-lg font-semibold">Tidak terverifikasi</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{result.reason}</p>
            </CardContent>
          </Card>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Admin kampus?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Masuk untuk menerbitkan ijazah
          </Link>
        </p>
      </main>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : "font-medium"}>{value}</dd>
    </div>
  );
}
