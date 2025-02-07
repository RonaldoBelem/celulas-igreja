//const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';
//
//export const url = isProd 
//  ? "https://celulas-igreja-api.onrender.com"
//  : "https://celulas-igreja-api.onrender.com/";
//

const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';

export const url = isProd 
  ? "/api"  // Usa o rewrite configurado no vercel.json
  : "http://localhost:3000/api";



/* ip da api 

35.160.120.126
44.233.151.27
34.211.200.85

*/
