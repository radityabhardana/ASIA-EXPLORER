async function inspectThreeJs() {
  const jsUrl = 'https://fudo.tree-public-squares.com/_astro/FudoImmersivePage.astro_astro_type_script_index_0_lang.BA_PCVde.js';
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  // Find where WebGLRenderer is initialized and what meshes are added
  const rendererIdx = jsText.indexOf('WebGLRenderer');
  if (rendererIdx !== -1) {
    console.log('--- Around WebGLRenderer ---');
    console.log(jsText.slice(Math.max(0, rendererIdx - 200), rendererIdx + 600));
  }

  // Find shaders or uniforms
  const shaderIdx = jsText.indexOf('fragmentShader');
  if (shaderIdx !== -1) {
    console.log('--- FragmentShader ---');
    console.log(jsText.slice(shaderIdx, shaderIdx + 500));
  }

  // Check what the 3D visual actually is (points, particles, relief, terrain, curved lines?)
  const kwMatches = [];
  ['InstancedMesh', 'Points', 'LineSegments', 'TubeGeometry', 'CatmullRomCurve3', 'PlaneGeometry', 'SphereGeometry'].forEach(geom => {
    if (jsText.includes(geom)) kwMatches.push(geom);
  });
  console.log('Geometries used in Three:', kwMatches);
}
inspectThreeJs().catch(console.error);
