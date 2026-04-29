// =====================================================================
// Web3 Simulation Helpers
// =====================================================================
// Karena ini versi demo Hybrid, file ijazah disimpan di Lovable Cloud Storage
// (analog dengan IPFS) dan "transaksi blockchain" hanya disimulasikan dengan
// menghasilkan tx hash + block number deterministik dari hash file.
// Smart contract Solidity asli tetap disertakan di /contracts untuk dipelajari.
// =====================================================================

/** Compute SHA-256 of a File/Blob as a 0x-prefixed hex string. */
export async function sha256OfFile(file: Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return "0x" + bufToHex(new Uint8Array(hash));
}

/** Compute SHA-256 of an arbitrary string. */
export async function sha256OfString(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return "0x" + bufToHex(new Uint8Array(hash));
}

function bufToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate a fake but deterministic-looking IPFS CID from a hash. */
export function fakeIpfsCid(fileHash: string): string {
  // Produce a "bafy..."-like string (CIDv1 base32 has ~59 chars). Demo only.
  const clean = fileHash.replace(/^0x/, "");
  return "bafybei" + clean.slice(0, 52);
}

/** Generate a fake Ethereum-style tx hash from a seed. */
export async function fakeTxHash(seed: string): Promise<string> {
  return await sha256OfString(seed + ":" + Date.now() + ":" + Math.random());
}

/** Fake but plausible block number. */
export function fakeBlockNumber(): number {
  // Sepolia is currently around block 7-8M. Use a realistic range.
  return 7_500_000 + Math.floor(Math.random() * 500_000);
}

/** Fake admin wallet address derived from a user id. */
export async function fakeAddressFromUserId(userId: string): Promise<string> {
  const h = await sha256OfString("addr:" + userId);
  return "0x" + h.replace(/^0x/, "").slice(0, 40);
}

/** Generate a short, human-friendly certificate ID. */
export function makeCertId(): string {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += a[Math.floor(Math.random() * a.length)];
  return "IJZ-" + s.slice(0, 4) + "-" + s.slice(4, 10);
}

export function shortHash(h: string, n = 6): string {
  if (!h) return "";
  return h.length > 2 * n + 4 ? `${h.slice(0, n + 2)}…${h.slice(-n)}` : h;
}
