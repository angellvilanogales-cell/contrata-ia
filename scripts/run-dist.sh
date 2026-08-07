const { execSync } = require('child_process');

try {
  const out = execSync('node dist/index.js', { stdio: 'inherit' });
} catch (err) {
  // noop
}
