const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';

export const url = isProd 
  ? "https://celulas-igreja-api.onrender.com"
  : "https://celulas-igreja-api.onrender.com/api";






/* ip da api 

35.160.120.126
44.233.151.27
34.211.200.85

*/
