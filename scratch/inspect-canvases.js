async function inspectCanvases() {
  const res = await fetch('https://fudo.tree-public-squares.com/');
  const html = await res.text();
  
  const canvases = [...html.matchAll(/<canvas[^>]*>/g)].map(m => m[0]);
  console.log('Canvases in Fudo:', canvases);

  // Look for how the map/path/points are drawn
  // Let's search in the JS for where `zekkeiData` is used
  const scriptMatch = html.match(/src="(\/_astro\/[^"]+\.js)"/);
  if (scriptMatch) {
    const jsUrl = 'https://fudo.tree-public-squares.com' + scriptMatch[1];
    const jsRes = await fetch(jsUrl);
    const jsText = await jsRes.text();
    
    const zekkeiIdx = jsText.indexOf('zekkeiData');
    if (zekkeiIdx !== -1) {
      console.log('--- zekkeiData usage in JS ---');
      console.log(jsText.slice(zekkeiIdx - 100, zekkeiIdx + 800));
    }
  }
}
inspectCanvases().catch(console.error);
