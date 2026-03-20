export async function apiServer(url: string, options: RequestInit = {}) {
  // Uses absolute URL referencing our backend for server components
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
  const hasExplicitCache = typeof options.cache !== "undefined";
  const hasExplicitRevalidate =
    typeof options.next === "object" &&
    options.next !== null &&
    Object.prototype.hasOwnProperty.call(options.next, "revalidate");

  const fetchOptions: RequestInit = {
    ...options,
    // Default to ISR for better performance and to avoid static-generation conflicts.
    ...(hasExplicitCache || hasExplicitRevalidate
      ? {}
      : {
          next: {
            ...(options.next || {}),
            revalidate: 60,
          },
        }),
  };
  
  const res = await fetch(baseUrl + url, {
    ...fetchOptions,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "An error occurred while fetching data.");
  }
  return data;
}

export async function apiClient(url: string, options: RequestInit = {}) {
  // Uses absolute URL strictly pointing to NEXT_PUBLIC...
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
  
  const res = await fetch(baseUrl + url, {
    credentials: "include", // Pass HttpOnly cookies
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "An error occurred while fetching data.");
  }
  return data;
}
