// Exécuté avant `ng build` (voir package.json "build"). Permet de configurer l'URL
// de l'API backend au moment du build via une variable d'environnement Vercel
// (Project Settings → Environment Variables → API_URL), sans avoir à modifier ni
// recommitter environment.prod.ts à chaque changement d'URL de déploiement backend.
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.log('[set-api-url] API_URL non défini — environment.prod.ts existant conservé tel quel.');
  process.exit(0);
}

const content = `// Fichier généré au build par scripts/set-api-url.js à partir de la variable\n// d'environnement API_URL — ne pas éditer manuellement en production.\nexport const environment = {\n  production: true,\n  apiUrl: '${apiUrl.replace(/\/$/, '')}'\n};\n`;

fs.writeFileSync(target, content);
console.log(`[set-api-url] environment.prod.ts mis à jour avec apiUrl = ${apiUrl}`);
