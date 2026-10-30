async function checkImports() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  const imports = [...jsText.matchAll(/import\([\"'](\.\/[^\"']+)[\"']\)/g)].map(m => m[1]);
  console.log('Dynamic imports:', imports);

  for (const imp of imports) {
    const chunkUrl = 'https://fudo.tree-public-squares.com/_astro/' + imp.replace('./', '');
    console.log('Fetching chunk:', chunkUrl);
    const chunkRes = await fetch(chunkUrl);
    const chunkText = await chunkRes.text();
    console.log('  Length:', chunkText.length);
    if (chunkText.includes('worldCanvas') || chunkText.includes('pins') || chunkText.includes('CatmullRom') || chunkText.includes('TubeGeometry')) {
      console.log('  -> FOUND MAP/CANVAS LOGIC IN THIS CHUNK!');
      console.log(chunkText.slice(0, 500));
    }
  }
}
checkImports().catch(console.error);
