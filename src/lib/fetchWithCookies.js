import { cookies } from "next/headers";

export async function fetchWithCookies(
  url,
  method = "GET",
  headers = {},
  body = null
) {
  // Retrieve the accessToken from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Prepare headers, include the accessToken in the Cookie header
  const defaultHeaders = {
    "Content-Type": "application/json", // Default to JSON, change if needed
    ...(accessToken && { Cookie: `accessToken=${accessToken}` }),
    ...headers, // Include any additional headers
  };

  // Prepare the request options
  const options = {
    method, // 'GET' or 'POST'
    headers: defaultHeaders,
    credentials: "include",
    ...(body && { body: JSON.stringify(body) }), // Add body if provided (for POST requests)
  };

  try {
    const response = await fetch(url, options);

    // Handle redirect to login
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Parse and return the response data
    return await response.json();
  } catch (error) {
    // console.error("Error in fetchWithCookies:", error);
    throw error; // Rethrow for handling elsewhere
  }
}
