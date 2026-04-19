# ESize Production

## Gett ing Started

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

```bash
npm run build     # Build untuk production
npm run start     # Jalankan production build
npm run lint      # Cek kode pakai ESLint
```

---

## Tech Stack

| Teknologi    | Versi  | Fungsi              |
| ------------ | ------ | ------------------- |
| Next.js      | 14     | Framework (App Router) |
| React        | 18     | UI Library          |
| TypeScript   | 5      | Type safety         |
| Tailwind CSS | 3      | Styling             |
| ESLint       | 8      | Linting             |

---

## Path Alias

Project ini pakai alias `@/*` yang mengarah ke folder `src/*`.

```
@/components/ui/Button  →  src/components/ui/Button.tsx
@/hooks/useAuth         →  src/hooks/useAuth.ts
@/services/chat         →  src/services/chat.ts
```

Jangan pakai relative path panjang seperti `../../../components/ui/Button`.
Selalu pakai `@/components/ui/Button`.

---

## Penjelasan Setiap Folder

### `src/app/` — Halaman & Routing

Ini folder bawaan Next.js App Router. Setiap subfolder = 1 route/URL.

**Aturan: folder ini HANYA untuk routing. Jangan tulis logic di sini.**
File `page.tsx` cukup panggil komponen utama dari folder `features/`.

```
src/app/
├── layout.tsx              → Layout utama (berlaku untuk semua halaman)
├── page.tsx                → Halaman "/" (Home) → panggil komponen dari features/home/
├── chat/page.tsx           → Halaman "/chat" → panggil komponen dari features/chat/
├── editor/page.tsx         → Halaman "/editor" → panggil komponen dari features/editor/
├── category/page.tsx       → Halaman "/category" → panggil komponen dari features/category/
├── partnership/page.tsx    → Halaman "/partnership" → panggil komponen dari features/partnership/
└── about/page.tsx          → Halaman "/about" → panggil komponen dari features/about/
```

Kalau mau tambah halaman baru, misalnya `/contact`:
1. Buat folder `src/app/contact/`
2. Buat file `page.tsx` di dalamnya
3. Buat folder `src/features/contact/components/`
4. Tulis komponen utamanya di sana, lalu panggil dari `page.tsx`

---

### `src/features/` — Logic & Komponen Per Fitur

Ini **folder utama tempat kamu nulis kode**. Setiap fitur/halaman punya folder sendiri.

Komponen di sini **khusus untuk 1 fitur saja** dan tidak dipakai di fitur lain.

```
src/features/
├── home/components/         → Komponen yang HANYA dipakai di halaman Home
│   ├── HomePage.tsx            (komponen utama halaman Home)
│   ├── HeroSection.tsx         (section hero/banner)
│   └── ProductShowcase.tsx     (showcase produk)
│
├── chat/components/         → Komponen yang HANYA dipakai di halaman Chat
│   ├── ChatPage.tsx            (komponen utama halaman Chat)
│   ├── ChatBubble.tsx          (bubble percakapan)
│   ├── ChatInput.tsx           (input pesan)
│   └── ChatSidebar.tsx         (sidebar daftar percakapan)
│
├── editor/components/       → Komponen yang HANYA dipakai di halaman Editor
├── category/components/     → Komponen yang HANYA dipakai di halaman Category
├── partnership/components/  → Komponen yang HANYA dipakai di halaman Partnership
└── about/components/        → Komponen yang HANYA dipakai di halaman About
```

**Kapan pindah ke `components/`?**
Kalau suatu komponen ternyata dibutuhkan di **2 fitur atau lebih**, pindahkan dari `features/` ke `components/`.

---

### `src/components/` — Komponen yang Dipakai di Banyak Tempat

Komponen di sini **bersifat global** — bisa dipanggil dari fitur manapun.

#### `components/layout/` — Kerangka Halaman

Komponen yang membentuk struktur/layout halaman. Biasanya cuma ada 1 instance per halaman.

```
Contoh file:
├── Navbar.tsx          → Navigasi atas
├── Footer.tsx          → Footer bawah
├── Sidebar.tsx         → Sidebar navigasi
├── Header.tsx          → Header section
└── MainLayout.tsx      → Wrapper layout utama
```

#### `components/ui/` — Komponen UI Kecil (Reusable)

Komponen kecil yang dipakai berulang-ulang di banyak tempat. Seperti "building block".

```
Contoh file:
├── Button.tsx          → Tombol (primary, secondary, ghost, dll)
├── Input.tsx           → Input field
├── Modal.tsx           → Dialog/popup
├── Card.tsx            → Card container
├── Badge.tsx           → Label/tag kecil
├── Dropdown.tsx        → Dropdown menu
├── Spinner.tsx         → Loading spinner
└── Avatar.tsx          → Foto profil bulat
```

#### `components/animation/` — Komponen Animasi

Wrapper untuk animasi & transisi halaman (misal pakai Framer Motion).

```
Contoh file:
├── FadeIn.tsx          → Animasi muncul fade
├── SlideUp.tsx         → Animasi slide dari bawah
└── PageTransition.tsx  → Transisi antar halaman
```

---

### `src/hooks/` — Custom Hooks

Fungsi React hook buatan sendiri. Nama file **wajib diawali `use`**.

Taruh di sini kalau hook-nya dipakai di **lebih dari 1 komponen/fitur**.

```
Contoh file:
├── useAuth.ts          → Hook untuk cek status login user
├── useMediaQuery.ts    → Hook untuk deteksi ukuran layar (mobile/desktop)
├── useDebounce.ts      → Hook untuk delay input (search, dll)
├── useLocalStorage.ts  → Hook untuk baca/tulis localStorage
└── useClickOutside.ts  → Hook untuk deteksi klik di luar elemen
```

---

### `src/services/` — Panggilan API

**Semua komunikasi ke backend/server HARUS lewat folder ini.**
Jangan panggil `fetch()` langsung di komponen.

Satu file = satu domain/resource.

```
Contoh file:
├── auth.ts             → Login, register, logout, refresh token
├── chat.ts             → Kirim pesan, ambil riwayat chat
├── product.ts          → CRUD produk, search produk
├── category.ts         → Ambil daftar kategori
├── upload.ts           → Upload file/gambar
└── user.ts             → Ambil profil user, update profil
```

---

### `src/types/` — TypeScript Types & Interfaces

Definisi tipe data. Satu file = satu domain, isinya kumpulan `interface` dan `type`.

```
Contoh file:
├── auth.ts             → User, LoginPayload, RegisterPayload
├── chat.ts             → ChatMessage, Conversation, SendMessagePayload
├── product.ts          → Product, ProductFilter, ProductResponse
└── common.ts           → ApiResponse, PaginatedResponse (tipe yang dipakai di mana-mana)
```

---

### `src/lib/` — Fungsi Utility / Helper

Fungsi-fungsi kecil pembantu. **Bukan** React hook, **bukan** API call — murni fungsi biasa.

```
Contoh file:
├── utils.ts            → cn() untuk merge Tailwind class
├── format.ts           → formatPrice(), formatDate(), formatPhoneNumber()
├── validation.ts       → validateEmail(), validatePassword()
└── storage.ts          → getToken(), setToken(), removeToken()
```

---

### `src/constants/` — Nilai Konstanta

Nilai-nilai tetap yang **tidak pernah berubah** saat app berjalan.

```
Contoh file:
├── navigation.ts       → NAV_LINKS (daftar menu navigasi)
├── size.ts             → SIZE_OPTIONS (XS, S, M, L, XL, XXL)
├── routes.ts           → ROUTES (daftar URL path)
└── api.ts              → API_ENDPOINTS (daftar endpoint backend)
```

---

### `src/config/` — Konfigurasi App

Konfigurasi yang **bisa berbeda** per environment (development vs production).

```
Contoh file:
├── site.ts             → Nama app, deskripsi, URL
└── env.ts              → Validasi & export environment variables
```

---

### `src/providers/` — React Context Providers

Provider untuk state global. Dibungkus di `src/app/layout.tsx`.

```
Contoh file:
├── ThemeProvider.tsx    → Dark mode / light mode
├── AuthProvider.tsx     → Status login user
└── ToastProvider.tsx    → Notifikasi toast
```

---

### `src/middleware/` — Middleware

Logic yang jalan sebelum request masuk ke halaman (cek auth, redirect, dll).

---

### `src/styles/` — Global Styles

File CSS global dan custom Tailwind.

```
Contoh file:
├── globals.css         → CSS global, Tailwind directives, custom CSS variables
└── fonts.css           → Import font custom (kalau ada)
```

---

## Naming Convention

| Jenis              | Aturan Nama File         | Contoh File          | Contoh Isi                |
| ------------------ | ------------------------ | -------------------- | ------------------------- |
| Komponen           | PascalCase `.tsx`        | `ChatBubble.tsx`     | `export function ChatBubble()` |
| Hook               | camelCase, awali `use`   | `useAuth.ts`         | `export function useAuth()` |
| Service            | camelCase `.ts`          | `chat.ts`            | `export async function getMessages()` |
| Type               | camelCase `.ts`          | `chat.ts`            | `export interface ChatMessage` |
| Utility            | camelCase `.ts`          | `format.ts`          | `export function formatPrice()` |
| Konstanta (value)  | UPPER_SNAKE_CASE         | `navigation.ts`      | `export const NAV_LINKS = [...]` |

---

## Ringkasan: Taruh File di Mana?

```
Aku mau buat komponen baru...
│
├── Cuma dipakai di 1 halaman?
│   └── YA → src/features/[nama-fitur]/components/
│
├── Dipakai di banyak halaman?
│   ├── Ini layout (Navbar, Footer)? → src/components/layout/
│   ├── Ini UI kecil (Button, Modal)? → src/components/ui/
│   └── Ini animasi? → src/components/animation/
│
├── Ini custom hook? → src/hooks/
├── Ini panggilan API? → src/services/
├── Ini type/interface? → src/types/
├── Ini fungsi helper? → src/lib/
├── Ini nilai konstanta? → src/constants/
├── Ini config/env? → src/config/
├── Ini context provider? → src/providers/
└── Ini global CSS? → src/styles/
```
