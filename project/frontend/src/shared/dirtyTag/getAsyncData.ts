export const getAsyncData = async <T>(url: string): Promise<T> => {
  const response: Response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};