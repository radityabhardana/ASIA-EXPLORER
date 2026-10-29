async function inspectModelLoading() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();

  const start = 149500;
  console.log(jsText.slice(start, start + 3000));
}
inspectModelLoading().catch(console.error);
