export const getAiEndpoint = () => {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
};

export const getAiHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}); 