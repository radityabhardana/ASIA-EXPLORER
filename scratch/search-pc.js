async function searchPc() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  // Find references to pc
  const matches = [...jsText.matchAll(/[^a-zA-Z0-9_]pc[^a-zA-Z0-9_]/g)];
  console.log('Matches count:', matches.length);
  for (const m of matches.slice(0, 5)) {
    const idx = m.index;
    console.log('--- pc reference ---');
    console.log(jsText.slice(Math.max(0, idx - 100), Math.min(jsText.length, idx + 200)));
  }
}
searchPc().catch(console.error);
