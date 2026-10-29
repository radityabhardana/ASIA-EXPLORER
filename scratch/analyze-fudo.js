async function run() {
  const res = await fetch('https://fudo.tree-public-squares.com/');
  const html = await res.text();
  console.log('HTML length:', html.length);
  console.log('Has canvas:', html.includes('<canvas'));
  console.log('Has svg:', html.includes('<svg'));
  console.log('Has video:', html.includes('<video'));
  console.log('Has audio:', html.includes('<audio'));
  
  // Extract CSS
  const cssMatches = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)];
  console.log('CSS links:', cssMatches.map(m => m[1]));

  // Extract structural containers
  const containers = [...html.matchAll(/<(header|nav|main|footer|section|article)[^>]*>/g)].map(m => m[0]);
  console.log('Semantic containers:', containers.slice(0, 30));

  // Extract classes
  const classes = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    m[1].split(/\s+/).forEach(c => classes.add(c));
  }
  console.log('Classes count:', classes.size);
  console.log('Sample classes:', [...classes].slice(0, 30));

  // Check zekkeiData or scripts
  const zekkei = html.match(/id="zekkeiData">([\s\S]*?)<\/script>/);
  if (zekkei) {
    try {
      const data = JSON.parse(zekkei[1]);
      console.log('zekkeiData length:', Array.isArray(data) ? data.length : Object.keys(data));
      if (Array.isArray(data)) console.log('Sample zekkei item:', data[0]);
    } catch (e) {
      console.log('zekkei data raw preview:', zekkei[1].slice(0, 200));
    }
  }

  // Find scripts and inspect the module JS
  const scriptMatches = [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)];
  for (const sm of scriptMatches) {
    const jsUrl = 'https://fudo.tree-public-squares.com' + sm[1];
    console.log('Fetching JS:', jsUrl);
    const jsRes = await fetch(jsUrl);
    const jsText = await jsRes.text();
    console.log('JS length:', jsText.length);
    ['three', 'map', 'mapbox', 'maplibre', 'gsap', 'lenis', 'scroll', 'camera', 'geo', 'coordinates', 'lat', 'sound', 'audio', 'howler', 'canvas', 'svg', 'pointer', 'progress', 'rail'].forEach(kw => {
      console.log('  ' + kw + ':', jsText.toLowerCase().includes(kw));
    });
  }
}
run().catch(console.error);
