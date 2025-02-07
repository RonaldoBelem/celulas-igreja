//const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';
//
//export const url = isProd 
//  ? "https://celulas-igreja-api.onrender.com"
//  : "https://celulas-igreja-api.onrender.com/";
//

const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// Remove o /api da URL base pois já está incluído nas rotas
export const url = isProd 
  ? ""  // URL base vazia pois o /api já está nas rotas
  : "http://localhost:3000";



/* ip da api 

35.160.120.126
44.233.151.27
34.211.200.85

*/
