# ChainIjazah — Verifikasi Ijazah Digital di Web3

Sistem website untuk mencegah pemalsuan ijazah dengan menyimpan **sidik digital
(SHA-256)** ijazah ke **blockchain** dan file PDF-nya ke **IPFS**. Verifikasi
publik bisa dilakukan dengan **scan QR Code** atau **upload ulang PDF**.

> Versi ini berjalan dalam mode **Hybrid Demo**:
> UI lengkap & alur kerja end-to-end, namun blockchain & IPFS **disimulasikan**
> di Lovable Cloud (database + storage). Smart contract Solidity asli tetap
> disertakan di `contracts/IjazahRegistry.sol` untuk dipelajari & di-deploy.

---

## ✨ Fitur

- 🔐 **Login/Signup admin kampus** (email + password)
- 📤 **Upload data ijazah** (nama, NIM, jurusan, tahun lulus, file PDF)
- 🧬 **Hash SHA-256** dihitung di browser sebelum file dikirim
- 🌐 **Penyimpanan file** ke IPFS (disimulasikan dengan Cloud Storage)
- ⛓️ **Penyimpanan hash + CID** ke smart contract (disimulasikan dengan tabel append-only)
- 🧾 **Generate QR Code** untuk dicetak di ijazah
- 🔎 **Halaman verifikasi publik** — cek dengan Cert ID/Hash atau **upload ulang PDF**

---

## 🗂️ Struktur Project

```
contracts/
  IjazahRegistry.sol           # Smart contract Solidity
src/
  components/SiteHeader.tsx    # Header global
  lib/web3-sim.ts              # Helper SHA-256, fake CID/tx hash, dsb.
  routes/
    __root.tsx                 # Layout + SEO global
    index.tsx                  # Landing page
    login.tsx                  # Login & signup admin
    verify.tsx                 # Halaman verifikasi publik
    admin/
      index.tsx                # Dashboard admin
      upload.tsx               # Form terbitkan ijazah
    cert.$certId.tsx           # Detail ijazah + QR
```

---

## 🚀 Menjalankan secara Lokal

Dependency sudah di-install otomatis (`bun install`). Tinggal:

```bash
bun run dev
```

Buka URL preview, klik **Login Admin** → **Daftar admin** untuk membuat akun
admin kampus pertama (signup pertama otomatis dapat role `admin`).

---

## ⛓️ Deploy Smart Contract ke Sepolia (Opsional, Pembelajaran)

`contracts/IjazahRegistry.sol` adalah versi minimal & ber-komentar. Cara paling
mudah: **Remix IDE**.

1. Buka <https://remix.ethereum.org>
2. Buat file baru `IjazahRegistry.sol`, paste isi `contracts/IjazahRegistry.sol`.
3. Tab **Solidity Compiler** → pilih `0.8.20` → **Compile**.
4. Tab **Deploy & Run** → Environment: **Injected Provider — MetaMask**.
5. Pastikan MetaMask kamu di jaringan **Sepolia testnet** (ambil ETH dari faucet:
   <https://sepoliafaucet.com> atau <https://www.alchemy.com/faucets/ethereum-sepolia>).
6. Klik **Deploy**, konfirmasi di MetaMask. Catat alamat kontrak.
7. (Opsional) Tambah admin lain via fungsi `addAdmin(address)`.

### Memanggil kontrak dari frontend (sketsa)

Untuk meng-aktifkan integrasi nyata, install `ethers` lalu ganti pemanggilan
`fakeTxHash`/`fakeBlockNumber` di `src/routes/admin/upload.tsx` dengan:

```ts
import { ethers } from "ethers";
import abi from "./IjazahRegistry.abi.json"; // hasil compile dari Remix

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

const certIdBytes = ethers.keccak256(ethers.toUtf8Bytes(certId));
const fileHashBytes = "0x" + fileHash.replace(/^0x/, "");
const tx = await contract.register(certIdBytes, fileHashBytes, ipfsCid);
const receipt = await tx.wait();
const txHash = receipt.hash;
const block = receipt.blockNumber;
```

---

## 🌍 Upload File ke IPFS (Opsional)

Daftar gratis di <https://www.pinata.cloud> → **API Keys** → buat key.
Lalu, alih-alih `supabase.storage.from("ijazah-files").upload(...)`,
panggil REST Pinata:

```ts
const fd = new FormData();
fd.append("file", file);
const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  method: "POST",
  headers: { Authorization: `Bearer ${PINATA_JWT}` },
  body: fd,
});
const { IpfsHash } = await res.json(); // = CID asli
```

> Karena `PINATA_JWT` adalah secret, simpan via **Lovable Cloud Secrets** dan
> panggil dari server function (`createServerFn`) — jangan ditaruh di kode client.

---

## 🦊 Menghubungkan ke MetaMask (Sketsa)

```ts
async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask belum terpasang");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}
```

---

## 🧠 Konsep Singkat

| Konsep        | Penjelasan |
|---------------|------------|
| **SHA-256**   | Mengubah file menjadi string unik 256-bit; ubah 1 bit file → hash berubah total. |
| **IPFS**      | Sistem penyimpanan file terdesentralisasi. File dikenali lewat **CID** (hash kontennya). |
| **Smart Contract** | Program kecil di blockchain. Sekali ditulis tidak bisa diubah, dapat dipanggil siapa saja. |
| **Tx Hash**   | ID unik transaksi blockchain — bukti permanen aksi sudah tercatat. |

---

## 🔒 Catatan Keamanan

- File ijazah bersifat publik (siapa pun yang punya URL bisa unduh) — sesuai
  kebutuhan verifikasi publik. Jangan upload dokumen rahasia.
- Hanya akun ber-role `admin` (otomatis untuk semua signup di demo ini) yang
  bisa menerbitkan ijazah. Untuk produksi, nonaktifkan auto-admin di trigger
  `handle_new_user`.

---

Selamat belajar Web3! 🚀
