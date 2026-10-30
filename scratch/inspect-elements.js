async function inspectHtmlElements() {
  const res = await fetch('https://fudo.tree-public-squares.com/');
  const html = await res.text();
  
  const extractId = (id) => {
    const regex = new RegExp(`(<[^>]+id="${id}"[\\s\\S]*?>)`, 'i');
    const m = html.match(regex);
    return m ? m[1] : 'not found';
  };

  ['siteHeader', 'latRail', 'latMarker', 'secondGround', 'mediaWall', 'introSec', 'hokkaido', 'transit'].forEach(id => {
    console.log(`=== ID: ${id} ===`);
    const regex = new RegExp(`(<[^>]+id="${id}"[^>]*>[\\s\\S]*?)(?=<\\/|<div|<section|<header|<aside|$)`, 'i');
    const m = html.match(regex);
    if (m) {
      console.log(m[1].slice(0, 500));
    } else {
      console.log('Not matched by regex');
    }
  });

  // Let's also search for latRail in the HTML
  const latRailIdx = html.indexOf('id="latRail"');
  if (latRailIdx !== -1) {
    console.log('--- latRail HTML snippet ---');
    console.log(html.slice(latRailIdx - 50, latRailIdx + 800));
  }
}
inspectHtmlElements().catch(console.error);
