export async function initApp() {
  const fs = require('fs');
  const path = require('path');
  let jsYaml;
  try {
    jsYaml = require('js-yaml');
  } catch (e) {
    return { ok: false, reason: 'Missing dependency js-yaml. Run npm ci', details: e.message };
  }

  const versionFile = path.join(__dirname, '..', 'knowledge', 'VERSION.yaml');
  try {
    const content = fs.readFileSync(versionFile, 'utf8');
    const data = jsYaml.load(content);
    return { ok: true, version: data || null };
  } catch (err) {
    return { ok: false, reason: 'Cannot read VERSION.yaml', details: err.message };
  }
}
