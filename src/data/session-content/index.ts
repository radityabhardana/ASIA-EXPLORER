import type { SessionContent } from '@/lib/storage/types';
import japan from './japan';
import korea from './korea';
import indonesia from './indonesia';
import thailand from './thailand';
import vietnam from './vietnam';
import malaysia from './malaysia';
import philippines from './philippines';
import india from './india';
import china from './china';

// Keys match the ISO-2 country IDs used in countries.json
export const SESSION_CONTENT: Record<string, SessionContent> = {
  jp: japan,
  kr: korea,
  id: indonesia,
  th: thailand,
  vn: vietnam,
  my: malaysia,
  ph: philippines,
  in: india,
  cn: china,
};
