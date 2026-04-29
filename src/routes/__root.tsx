import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ChainIjazah — Verifikasi Ijazah Digital di Blockchain" },
      {
        name: "description",
        content:
          "Sistem verifikasi keaslian ijazah berbasis Web3. Hash SHA-256 disimpan di blockchain, file PDF di IPFS, dan diverifikasi publik lewat QR Code.",
      },
      { name: "author", content: "ChainIjazah" },
      { property: "og:title", content: "ChainIjazah — Verifikasi Ijazah Digital di Blockchain" },
      {
        property: "og:description",
        content:
          "Cegah pemalsuan ijazah dengan blockchain & IPFS. Cek keaslian ijazah hanya dengan QR Code atau hash.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ChainIjazah — Verifikasi Ijazah Digital di Blockchain" },
      { name: "description", content: "EduChain Verify is a Web3 application for verifying digital diplomas using blockchain technology." },
      { property: "og:description", content: "EduChain Verify is a Web3 application for verifying digital diplomas using blockchain technology." },
      { name: "twitter:description", content: "EduChain Verify is a Web3 application for verifying digital diplomas using blockchain technology." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c290158a-9a3b-4c37-bde5-5e6320ebfd78/id-preview-62f0af65--f1294271-38a4-4886-a081-9b5c7d0a653c.lovable.app-1777434497204.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c290158a-9a3b-4c37-bde5-5e6320ebfd78/id-preview-62f0af65--f1294271-38a4-4886-a081-9b5c7d0a653c.lovable.app-1777434497204.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
