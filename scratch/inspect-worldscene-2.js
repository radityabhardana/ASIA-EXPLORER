async function inspectRestOfWorldScene() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();

  const start = 152500;
  console.log(jsText.slice(start, start + 3000));
}
inspectRestOfWorldScene().catch(console.error);
