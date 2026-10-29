async function inspectWorldScene() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();

  // Search for "canvas: pc" or "canvas:pc"
  const matches = [...jsText.matchAll(/canvas\s*:\s*pc/g)];
  console.log('canvas: pc matches:', matches.length);
  for (const m of matches) {
    const idx = m.index;
    console.log('--- snippet around canvas: pc ---');
    console.log(jsText.slice(Math.max(0, idx - 100), Math.min(jsText.length, idx + 1000)));
  }
}
inspectWorldScene().catch(console.error);
