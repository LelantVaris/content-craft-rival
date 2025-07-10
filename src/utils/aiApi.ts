export const getApiUrl = () => {
  return 'https://zvdftnetinkhjrxkitnl.supabase.co';
};

export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
});

export const streamCompletion = async (prompt: string, options = {}) => {
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      prompt,
      ...options
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate completion');
  }

  return response;
};
