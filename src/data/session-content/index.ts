export { default as japan } from './japan';
export { default as korea } from './korea';
export { default as indonesia } from './indonesia';
export { default as thailand } from './thailand';
export { default as vietnam } from './vietnam';
export { default as malaysia } from './malaysia';
export { default as philippines } from './philippines';
export { default as india } from './india';
export { default as china } from './china';
export { default as taiwan } from './taiwan';

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
import taiwan from './taiwan';

export const SESSION_CONTENT: Record<string, SessionContent> = {
  japan, korea, indonesia, thailand, vietnam, malaysia, philippines, india, china, taiwan,
};
