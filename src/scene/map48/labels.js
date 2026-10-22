import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * Label nama negara via CSS2DRenderer — dipilih daripada overlay manual
 * karena posisi ikut transform grup negara (naik saat hover) gratis.
 * Label terpasang ke grup masing-masing negara, default tersembunyi.
 */
export function attachLabels(countries) {
  for (const c of countries) {
    const el = document.createElement('div');
    el.className = 'country-label';

    const body = document.createElement('div');
    body.className = 'country-label__body';

    const name = document.createElement('span');
    name.className = 'country-label__name';
    name.textContent = c.name;

    const sub = document.createElement('span');
    sub.className = 'country-label__sub';
    sub.textContent = `${c.code} · ${c.region}`;

    body.append(name, sub);
    el.appendChild(body);

    const obj = new CSS2DObject(el);
    obj.position.copy(c.anchor);
    c.group.add(obj);
    c.labelEl = el;
  }
}

export function setLabelVisible(country, visible) {
  if (country && country.labelEl) country.labelEl.classList.toggle('is-visible', visible);
}
