const API_BASE_URL = 'https://beta.soldoutafrica.com/api';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'API error' }));
      console.error('API Error Response:', errorData);
      throw new Error(
        `API call failed with status ${response.status}: ${errorData.message || 'Unknown error'}`
      );
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API Client Error making request to ${url}:`, error);
    throw error;
  }
}
