import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App, { APP_ROOT_ID } from '@/app/App';

describe('fondasi aplikasi', () => {
  it('merender wadah aplikasi dengan id yang stabil', () => {
    render(createElement(App));

    expect(APP_ROOT_ID).toBe('app-root');
    expect(document.getElementById(APP_ROOT_ID)).toBeInTheDocument();
  });
});
