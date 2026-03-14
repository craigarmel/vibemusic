export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json();
  if (!response.ok || payload.status !== "success") {
    throw new Error(payload.detail ?? payload.message ?? "Request failed");
  }

  return payload.data as T;
}
