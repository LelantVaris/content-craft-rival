const getApiUrl = () => {
    return 'https://zvdftnetinkhjrxkitnl.supabase.co';
};

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
});

export async function callAiFunction(body: object): Promise<Response> {
    const response = await fetch(`${getApiUrl()}/functions/v1/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
    });

    return response;
} 