import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Fingerprint,
  Globe2,
  QrCode,
  Database,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChainIjazah — Verifikasi Ijazah Digital di Blockchain" },
      {
        name: "description",
        content:
          "Sistem Web3 untuk memverifikasi keaslian ijazah. Hash SHA-256 di blockchain, file di IPFS, QR Code untuk verifikasi publik.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Powered by Blockchain × IPFS
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Ijazah Anti-Palsu, <br />
              <span className="text-gradient">Terverifikasi di Web3</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              ChainIjazah menyimpan sidik digital (SHA-256) ijazah ke blockchain dan
              filenya ke IPFS. Siapa pun bisa cek keaslian ijazah dalam hitungan detik
              — cukup scan QR Code atau upload PDF.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/verify">
                <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                  Verifikasi Ijazah <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Login Admin Kampus
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> SHA-256</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> IPFS Storage</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Smart Contract</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> QR Verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Cara Kerja</h2>
            <p className="mt-3 text-muted-foreground">Empat langkah sederhana, hasil yang tidak bisa dipalsukan.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Database, title: "1. Input Data", desc: "Admin kampus upload data mahasiswa & file PDF ijazah." },
              { icon: Fingerprint, title: "2. Generate Hash", desc: "File diubah menjadi sidik digital SHA-256 yang unik." },
              { icon: Globe2, title: "3. Simpan ke Chain & IPFS", desc: "Hash dikunci di blockchain, file dititip di IPFS." },
              { icon: QrCode, title: "4. QR untuk Publik", desc: "QR Code dicetak di ijazah agar siapa pun bisa verifikasi." },
            ].map((step) => (
              <div
                key={step.title}
                className="group relative rounded-xl border border-border bg-card p-6 shadow-card transition hover:border-primary/50"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground transition group-hover:shadow-glow">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Kenapa <span className="text-gradient">Web3?</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Pemalsuan ijazah jadi mahal & mudah dideteksi. Data hash di blockchain
                bersifat <em>immutable</em> — tidak bisa diubah oleh siapa pun, termasuk
                admin yang menerbitkan.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Tidak ada satu pihak pun yang dapat memalsukan ijazah.",
                  "Verifikasi tanpa harus menelepon kampus.",
                  "Hemat biaya: verifikator cukup scan QR.",
                  "Smart contract Solidity open source & disertakan.",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 font-mono text-sm shadow-card">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="ml-2">IjazahRegistry.sol</span>
              </div>
              <pre className="overflow-x-auto text-xs leading-relaxed text-muted-foreground">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IjazahRegistry {
  struct Cert {
    bytes32 fileHash;
    string  ipfsCid;
    address issuer;
    uint256 issuedAt;
  }
  mapping(bytes32 => Cert) public certs;

  function register(
    bytes32 certId,
    bytes32 fileHash,
    string  calldata cid
  ) external onlyAdmin { ... }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Siap mulai melindungi ijazah kampus Anda?
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Daftar / Login Admin
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline">
                Coba Verifikasi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ChainIjazah · Demo edukasi blockchain untuk verifikasi ijazah</p>
      </footer>
    </div>
  );
}
