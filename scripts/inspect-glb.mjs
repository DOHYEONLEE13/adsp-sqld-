// Quick GLB inspector — reads JSON chunk and dumps clip names, scene nodes, bbox hint.
import fs from 'node:fs';
import path from 'node:path';

function inspect(filePath) {
  const buf = fs.readFileSync(filePath);
  // GLB header: magic(4) version(4) length(4)
  const magic = buf.toString('ascii', 0, 4);
  if (magic !== 'glTF') throw new Error('not a GLB: ' + filePath);
  const version = buf.readUInt32LE(4);
  // First chunk: length(4) type(4) data(length)
  const jsonLen = buf.readUInt32LE(12);
  const jsonType = buf.toString('ascii', 16, 20);
  if (jsonType !== 'JSON') throw new Error('first chunk is not JSON: ' + jsonType);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
  const gltf = JSON.parse(jsonStr);

  console.log(`\n=== ${path.basename(filePath)} (glTF v${version}) ===`);
  console.log('meshes:', (gltf.meshes ?? []).length, 'nodes:', (gltf.nodes ?? []).length, 'animations:', (gltf.animations ?? []).length);
  console.log('generator:', gltf.asset?.generator ?? '—');

  if (gltf.animations?.length) {
    console.log('animation clip names:');
    gltf.animations.forEach((a, i) => console.log(`  [${i}] "${a.name ?? '(unnamed)'}" channels=${a.channels.length} samplers=${a.samplers.length}`));
  } else {
    console.log('animations: none');
  }

  // Root nodes in scene
  const sceneIdx = gltf.scene ?? 0;
  const scene = gltf.scenes?.[sceneIdx];
  if (scene) {
    const rootNames = scene.nodes.map((i) => gltf.nodes[i]?.name ?? `node#${i}`);
    console.log('root nodes:', rootNames.join(', '));
  }

  // Bounding box estimate — scan all accessors with type=VEC3 that look like positions (min/max present).
  let overallMin = [Infinity, Infinity, Infinity];
  let overallMax = [-Infinity, -Infinity, -Infinity];
  for (const acc of gltf.accessors ?? []) {
    if (acc.type === 'VEC3' && acc.min && acc.max && acc.count > 0) {
      for (let k = 0; k < 3; k++) {
        overallMin[k] = Math.min(overallMin[k], acc.min[k]);
        overallMax[k] = Math.max(overallMax[k], acc.max[k]);
      }
    }
  }
  if (overallMin[0] !== Infinity) {
    const size = overallMax.map((v, i) => v - overallMin[i]);
    console.log('bbox min:', overallMin.map((v) => v.toFixed(2)).join(', '));
    console.log('bbox max:', overallMax.map((v) => v.toFixed(2)).join(', '));
    console.log('bbox size (W×H×D):', size.map((v) => v.toFixed(2)).join(' × '));
    console.log('height (Y):', size[1].toFixed(2), '→ to make 1.8u tall, scale ≈', (1.8 / size[1]).toFixed(3));
  }
}

const dir = 'public/battle';
for (const f of ['hero.glb', 'monster.glb', 'field.glb']) {
  inspect(path.join(dir, f));
}
