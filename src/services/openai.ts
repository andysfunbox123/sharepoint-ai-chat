export async function generateResponse(query: string, context: string) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate response');
  }

  return response.json();
}