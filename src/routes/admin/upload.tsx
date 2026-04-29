import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, ShieldCheck } from "lucide-react";
import {
  sha256OfFile,
  fakeIpfsCid,
  fakeTxHash,
  fakeBlockNumber,
  fakeAddressFromUserId,
  makeCertId,
  shortHash,
} from "@/lib/web3-sim";

export const Route = createFileRoute("/admin/upload")({
  head: () => ({ meta: [{ title: "Terbitkan Ijazah — ChainIjazah" }] }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama: "",
    nim: "",
    jurusan: "",
    tahun_lulus: new Date().getFullYear(),
  });
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"idle" | "hashing" | "uploading" | "chain" | "done">("idle");
  const [progress, setProgress] = useState<{
    hash?: string;
    cid?: string;
    tx?: string;
    block?: number;
    certId?: string;
  }>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
      } else {
        setUserId(data.session.user.id);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      return;
    }

    try {
      // 1) HASH
      setStep("hashing");
      const fileHash = await sha256OfFile(file);
      setProgress((p) => ({ ...p, hash: fileHash }));

      // 2) UPLOAD ke "IPFS" (Lovable Cloud Storage sebagai simulasi)
      setStep("uploading");
      const certId = makeCertId();
      const filePath = `${userId}/${certId}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("ijazah-files")
        .upload(filePath, file, { contentType: "application/pdf", upsert: false });
      if (upErr) throw upErr;
      const cid = fakeIpfsCid(fileHash);
      setProgress((p) => ({ ...p, cid, certId }));

      // 3) "Tulis ke smart contract" (simulasi)
      setStep("chain");
      const tx = await fakeTxHash(fileHash);
      const block = fakeBlockNumber();
      const address = await fakeAddressFromUserId(userId);
      setProgress((p) => ({ ...p, tx, block }));

      // 4) Simpan ke DB
      const { error: insErr } = await supabase.from("ijazah").insert({
        cert_id: certId,
        nama: form.nama,
        nim: form.nim,
        jurusan: form.jurusan,
        tahun_lulus: Number(form.tahun_lulus),
        file_hash: fileHash,
        ipfs_cid: cid,
        tx_hash: tx,
        block_number: block,
        file_path: filePath,
        issuer_id: userId,
        issuer_address: address,
      });
      if (insErr) throw insErr;

      setStep("done");
      toast.success("Ijazah berhasil diterbitkan ke blockchain (simulasi)");
      setTimeout(() => navigate({ to: "/cert/$certId", params: { certId } }), 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menerbitkan ijazah";
      toast.error(msg);
      setStep("idle");
    }
  };

  const busy = step !== "idle" && step !== "done";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
        </Link>

        <Card className="bg-card shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Upload className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="font-display text-2xl">Terbitkan Ijazah Baru</CardTitle>
                <CardDescription>
                  Data hash & CID akan dikunci di blockchain (simulasi).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM</Label>
                  <Input
                    id="nim"
                    required
                    value={form.nim}
                    onChange={(e) => setForm({ ...form, nim: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jurusan">Jurusan</Label>
                  <Input
                    id="jurusan"
                    required
                    value={form.jurusan}
                    onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahun">Tahun Lulus</Label>
                  <Input
                    id="tahun"
                    type="number"
                    min={1980}
                    max={2100}
                    required
                    value={form.tahun_lulus}
                    onChange={(e) =>
                      setForm({ ...form, tahun_lulus: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File Ijazah (PDF)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {file.name} · {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              {(busy || step === "done") && (
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs">
                  <StepLine
                    label="① Hashing file (SHA-256)"
                    active={step === "hashing"}
                    done={!!progress.hash}
                    value={progress.hash ? shortHash(progress.hash) : undefined}
                  />
                  <StepLine
                    label="② Upload ke IPFS"
                    active={step === "uploading"}
                    done={!!progress.cid}
                    value={progress.cid ? shortHash(progress.cid) : undefined}
                  />
                  <StepLine
                    label="③ Submit ke smart contract"
                    active={step === "chain"}
                    done={!!progress.tx}
                    value={
                      progress.tx
                        ? `${shortHash(progress.tx)} @ #${progress.block?.toLocaleString()}`
                        : undefined
                    }
                  />
                  {step === "done" && (
                    <div className="mt-2 flex items-center gap-2 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                      Ijazah {progress.certId} terbit. Mengarahkan…
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={busy || !file}
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {busy ? "Memproses…" : "Terbitkan ke Blockchain"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StepLine({
  label,
  active,
  done,
  value,
}: {
  label: string;
  active: boolean;
  done: boolean;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={done ? "text-primary" : active ? "text-foreground" : "text-muted-foreground"}>
        {active && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}
        {done && "✓ "}
        {label}
      </span>
      {value && <span className="text-muted-foreground">{value}</span>}
    </div>
  );
}
