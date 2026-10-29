import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pauseLenis, resumeLenis, refreshScrollEngine } from '@/lib/motion';

/**
 * ScrollController
 * Mengelola siklus scroll di seluruh aplikasi:
 * 1. Menghindari scroll lock pada body saat ganti halaman.
 * 2. Mengaktifkan Lenis hanya di landing page ('/') untuk scrub 3D globe timeline GSAP,
 *    sementara dashboard, auth, dan negara memakai native scrolling tanpa cegatan.
 * 3. Reset scroll ke atas (0, 0) saat rute berpindah, atau scroll mulus ke anchor #hash.
 */
export default function ScrollController() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 1. Bersihkan potensi kunci overflow pada body dari modal / drawer
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    // 2. Lifecycle Lenis:
    // Hanya halaman landing publik ('/') yang menggunakan Lenis untuk timeline 3D globe.
    // Dashboard, form kuis, peta, dan halaman detail negara memakai native browser scroll
    // agar responsif, bebas cegatan wheel, dan tidak pernah terkunci di limit 0.
    if (pathname === '/') {
      resumeLenis();
    } else {
      pauseLenis();
    }

    // 3. Gulir ke anchor #hash jika ada, selain itu reset ke puncak halaman (0, 0)
    if (hash) {
      const id = hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }

    refreshScrollEngine();
  }, [pathname, hash]);

  return null;
}
