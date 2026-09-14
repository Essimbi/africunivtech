// Valeur par défaut si la variable d'environnement Vercel API_URL n'est pas définie
// au moment du build (voir scripts/set-api-url.js, exécuté par `npm run build`).
export const environment = {
  production: true,
  apiUrl: '/api/v1'
};
