async function checkBacktickImports() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  const imports = [...jsText.matchAll(/import\(([`'"][^`'"]+[`'"])\)/g)].map(m => m[1]);
  console.log('Imports:', imports);

  for (const imp of imports) {
    const clean = imp.replace(/[`'"]/g, '').replace('./', '');
    const chunkUrl = 'https://fudo.tree-public-squares.com/_astro/' + clean;
    console.log('Fetching chunk:', chunkUrl);
    const chunkRes = await fetch(chunkUrl);
    const chunkText = await chunkRes.text();
    console.log('  Length:', chunkText.length);
    ['worldCanvas', 'pins', 'CatmullRom', 'latRail', 'latMarker', 'orbit', 'camera'].forEach(w => {
      if (chunkText.includes(w)) console.log('    Found keyword:', w);
    });
  }
}
checkBacktickImports().catch(console.error);
