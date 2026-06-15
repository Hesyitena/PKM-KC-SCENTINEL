# Perubahan Font SCENTINEL Dashboard

## Ringkasan Perubahan

Website SCENTINEL telah diperbarui dengan sistem font yang lebih modern dan profesional untuk meningkatkan keterbacaan dan estetika UI.

---

## Font Stack Baru

### 1. **Outfit** (Display/Heading Font)
- **Penggunaan:** Semua heading (h1-h6), navigation items, buttons, badges
- **Weight:** 300, 400, 500, 600, 700
- **Karakteristik:** 
  - Geometris modern
  - Letter-spacing negatif untuk elegance
  - Sangat cocok untuk brand identity

### 2. **Inter** (Body Font)  
- **Penggunaan:** Body text, input fields, paragraf
- **Weight:** 300, 400, 500, 600
- **Karakteristik:**
  - Optimal untuk keterbacaan digital
  - OpenType features (ss01, rlig, calt)
  - Professional dan clean

### 3. **JetBrains Mono** (Monospace Font)
- **Penggunaan:** Data sensor (angka), timestamp, API keys, kode
- **Weight:** 400, 500, 600
- **Karakteristik:**
  - Tabular numbers (lebar sama)
  - Perfect untuk alignment angka
  - Mudah dibaca untuk data teknis

---

## Implementasi Teknis

### File yang Dimodifikasi

1. **`app/layout.tsx`**
   - Import 3 font families dari `next/font/google`
   - Set CSS variables: `--font-outfit`, `--font-inter`, `--font-mono`

2. **`app/globals.css`**
   - Update `body` font-family → Inter
   - Update `h1-h6` font-family → Outfit dengan weight 500-600
   - Update `.tabular-nums` → JetBrains Mono dengan `font-feature-settings: "tnum"`
   - Perbaikan semua komponen (`btn-primary`, `.nav-item`, `.badge-*`, `.pill-tag`)

3. **`tailwind.config.ts`**
   - Tambah font families:
     - `sans`: Inter
     - `display`: Outfit  
     - `mono`: JetBrains Mono

---

## Cara Menggunakan di Komponen

### Heading/Title
```tsx
<h1 className="font-display text-4xl font-semibold">
  SCENTINEL Dashboard
</h1>
```

### Body Text (default)
```tsx
<p className="text-base">
  Ini menggunakan Inter secara otomatis
</p>
```

### Data Sensor (monospace)
```tsx
<span className="font-mono tabular-nums text-lg font-medium">
  234.5 ppm
</span>
```

### Button (sudah menggunakan Outfit via CSS class)
```tsx
<button className="btn-primary">
  Submit Data
</button>
```

---

## Visual Improvement

### Sebelum
- Font: Inter di semua tempat (weight 300 light)
- Heading terlihat tipis dan kurang menonjol
- Angka sensor tidak aligned sempurna

### Sesudah  
- **Heading:** Outfit (bold, modern, eye-catching)
- **Body:** Inter (optimal readability)
- **Data:** JetBrains Mono (perfect alignment, professional)
- **Better visual hierarchy** dengan kombinasi font yang kontras

---

## Performa

- ✅ Font loading dioptimalkan dengan `next/font/google`
- ✅ Font di-subset untuk Latin characters saja (ukuran kecil)
- ✅ `display: swap` mencegah FOIT (Flash of Invisible Text)
- ✅ Variable font weights untuk efisiensi

---

## Testing

```bash
cd frontend
npm run build    # Build sukses tanpa error
npm run dev      # Test di http://localhost:3000
```

---

**Catatan:** Semua perubahan fully backward compatible dan tidak memerlukan perubahan di backend atau ESP32 integration.
