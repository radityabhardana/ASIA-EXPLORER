async function inspectEveryWorldCanvas() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();

  let idx = 0;
  while ((idx = jsText.indexOf('worldCanvas', idx)) !== -1) {
    console.log('--- occurrence of worldCanvas at', idx, '---');
    console.log(jsText.slice(Math.max(0, idx - 100), Math.min(jsText.length, idx + 400)));
    idx += 11;
  }
}
inspectEveryWorldCanvas().catch(console.error);
