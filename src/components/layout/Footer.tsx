import { BRAND } from '@/data/site';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-base py-10 text-center text-[12px] tracking-widest text-cream/55 uppercase">
      © {year} {BRAND.nameKr} — ADSP · SQLD, {BRAND.tagline.split('—')[1]?.trim() ?? '놀면서 합격'}.
    </footer>
  );
}
