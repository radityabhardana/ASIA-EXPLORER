async function inspectMap() {
  const res = await fetch('https://fudo.tree-public-squares.com/');
  const html = await res.text();
  
  // Find all svg elements
  const svgs = [...html.matchAll(/<svg[^>]*>([\s\S]*?)<\/svg>/g)];
  console.log('SVG count:', svgs.length);
  svgs.forEach((s, idx) => {
    const id = s[0].match(/id="([^"]+)"/)?.[1] || 'no-id';
    const cls = s[0].match(/class="([^"]+)"/)?.[1] || 'no-class';
    console.log(`SVG #${idx} - id: ${id}, class: ${cls}, len: ${s[0].length}`);
    if (s[0].includes('path')) {
      const paths = [...s[0].matchAll(/<path/g)].length;
      console.log(`  contains ${paths} paths`);
    }
  });

  // Let's inspect the layout, typography, colors, navigation of Fudo
  // Find all font families in the HTML/CSS
  const fonts = [...html.matchAll(/font-[a-zA-Z0-9_-]+/g)].map(m => m[0]);
  console.log('Tailwind font classes:', [...new Set(fonts)]);

  // Let's check the design language:
  // background colors, text colors
  const colors = [...html.matchAll(/(bg|text|border)-\[#([0-9a-fA-F]{3,8})\]/g)].map(m => m[0]);
  console.log('Custom hex classes (sample):', [...new Set(colors)].slice(0, 30));
}
inspectMap().catch(console.error);
