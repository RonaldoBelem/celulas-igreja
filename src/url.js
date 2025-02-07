const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return "https://celulas-igreja-api.onrender.com";
  }
  return "http://localhost:3001";
};

export const url = getBaseUrl();
