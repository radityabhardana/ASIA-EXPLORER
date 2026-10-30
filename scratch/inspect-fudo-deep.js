async function inspect() {
  const res = await fetch('https://fudo.tree-public-squares.com/');
  const html = await res.text();
  
  // Look at zekkeiData
  const zekkeiMatch = html.match(/id="zekkeiData">([\s\S]*?)<\/script>/);
  if (zekkeiMatch) {
    const data = JSON.parse(zekkeiMatch[1]);
    console.log('--- ZEKKEI DATA KEYS ---', Object.keys(data));
    console.log('latTop / latBottom:', data.latTop, data.latBottom);
    console.log('anchorLats:', data.anchorLats);
    console.log('pins count:', data.pins?.length, 'sample pin:', data.pins?.[0]);
    console.log('areas count:', data.areas?.length, 'sample area:', data.areas?.[0]);
    console.log('path count:', data.path?.length, 'sample path:', data.path?.slice(0, 3));
  }

  // Look at intros, headers, overlays, HUD, rails
  const hudMatches = [...html.matchAll(/<(div|nav|aside|header)[^>]*id="([^"]+)"[^>]*>/g)];
  console.log('--- IDS IN DOM ---', hudMatches.map(m => m[2]));

  // Inspect the module JS for Three.js scene creation
  const scriptMatch = html.match(/src="(\/_astro\/[^"]+\.js)"/);
  if (scriptMatch) {
    const jsUrl = 'https://fudo.tree-public-squares.com' + scriptMatch[1];
    const jsRes = await fetch(jsUrl);
    const jsText = await jsRes.text();
    
    // Search for Three.js objects or canvas usage
    console.log('--- THREE.JS USAGE SNIPPETS ---');
    const threeOccurrences = [...jsText.matchAll(/(new THREE\.[a-zA-Z0-9]+|\.Scene\(|\.WebGLRenderer\(|PerspectiveCamera|OrthographicCamera|ShaderMaterial|MeshStandardMaterial|BufferGeometry)/g)].map(m => m[0]);
    console.log('Three constructs:', [...new Set(threeOccurrences)]);

    // Search for GSAP / ScrollTrigger
    const gsapOccurrences = [...jsText.matchAll(/(ScrollTrigger|gsap\.to|gsap\.timeline|Lenis)/g)].map(m => m[0]);
    console.log('Animation constructs:', [...new Set(gsapOccurrences)]);

    // Check for UI text or patterns
    console.log('--- UI LABELS / HUD / COPY PATTERNS ---');
    const hudStrings = [...jsText.matchAll(/["']([A-Z0-9°′″\s·\/\-_]{3,40})["']/g)].map(m => m[1]).filter(s => s.includes('°') || s.includes('KM') || s.includes('LAT') || s.includes('TRANSIT'));
    console.log('HUD strings:', [...new Set(hudStrings)].slice(0, 20));
  }
}
inspect().catch(console.error);
