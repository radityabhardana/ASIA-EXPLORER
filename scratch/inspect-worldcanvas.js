async function inspectWorldCanvas() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  const idx = jsText.indexOf('worldCanvas');
  if (idx !== -1) {
    console.log('--- Around worldCanvas ---');
    console.log(jsText.slice(idx, idx + 1200));
  }
}
inspectWorldCanvas().catch(console.error);
