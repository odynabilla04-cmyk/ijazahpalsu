import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, ExternalLink, Copy, ShieldCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { shortHash } from "@/lib/web3-sim";

type Ijazah = Tables<"ijazah">;

export const Route = createFileRoute("/cert/$certId")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("ijazah")
      .select("*")
      .eq("cert_id", params.certId)
      .maybeSingle();
    if (error || !data) throw notFound();
    return { ijazah: data as Ijazah };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Ijazah ${loaderData.ijazah.nama} — ${loaderData.ijazah.cert_id}`
          : "Detail Ijazah",
      },
      {
        name: "description",
        content: loaderData
          ? `Ijazah terverifikasi blockchain untuk ${loaderData.ijazah.nama} (${loaderData.ijazah.nim}).`
          : "Detail ijazah",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Ijazah tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cert ID tidak terdaftar di chain.</p>
        <Link to="/verify" className="mt-4 inline-block text-primary hover:underline">
          Kembali ke verifikasi
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: CertPage,
});

function CertPage() {
  const { ijazah } = Route.useLoaderData();
  const [qr, setQr] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    const verifyUrl = `${window.location.origin}/verify?id=${ijazah.cert_id}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 320,
      color: { dark: "#0b1220", light: "#ffffff" },
    }).then(setQr);

    const { data } = supabase.storage.from("ijazah-files").getPublicUrl(ijazah.file_path);
    setPdfUrl(data.publicUrl);
  }, [ijazah]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  };

  const downloadQR = () => {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${ijazah.cert_id}-qr.png`;
    a.click();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/verify"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <p className="font-display font-semibold text-primary">Terverifikasi di Blockchain</p>
            <p className="text-xs text-muted-foreground">
              Hash & CID ijazah ini terkunci di chain pada blok #{ijazah.block_number.toLocaleString()}.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Detail */}
          <Card className="bg-card shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-2xl">{ijazah.nama}</CardTitle>
              <CardDescription className="font-mono">
                {ijazah.cert_id} · NIM {ijazah.nim}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Jurusan" value={ijazah.jurusan} />
                <Field label="Tahun Lulus" value={String(ijazah.tahun_lulus)} />
                <Field label="Diterbitkan" value={new Date(ijazah.created_at).toLocaleString("id-ID")} />
                <Field label="Block" value={`#${ijazah.block_number.toLocaleString()}`} mono />
              </dl>

              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <ChainRow label="File Hash (SHA-256)" value={ijazah.file_hash} onCopy={copy} />
                <ChainRow label="IPFS CID" value={ijazah.ipfs_cid} onCopy={copy} />
                <ChainRow label="Tx Hash" value={ijazah.tx_hash} onCopy={copy} />
                <ChainRow label="Issuer Address" value={ijazah.issuer_address} onCopy={copy} />
              </div>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-medium transition hover:bg-muted/60"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  Lihat File PDF Ijazah
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* QR */}
          <Card className="bg-card shadow-card">
            <CardHeader>
              <CardTitle className="font-display">QR Verifikasi</CardTitle>
              <CardDescription>Cetak di ijazah agar publik bisa scan.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {qr ? (
                <img
                  src={qr}
                  alt={`QR Code verifikasi ${ijazah.cert_id}`}
                  className="rounded-lg border border-border bg-white p-2"
                  width={240}
                  height={240}
                />
              ) : (
                <div className="h-60 w-60 animate-pulse rounded-lg bg-muted" />
              )}
              <Button onClick={downloadQR} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download PNG
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Scan QR → halaman verifikasi publik.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={mono ? "mt-1 font-mono" : "mt-1 font-medium"}>{value}</dd>
    </div>
  );
}

function ChainRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (v: string, l: string) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <div>
        <div className="text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-mono break-all">{shortHash(value, 10)}</div>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label={`Salin ${label}`}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
