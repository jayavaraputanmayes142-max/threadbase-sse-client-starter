import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSSE(url, onMessage) {
  const { user } = useAuth();

  useEffect(() => {
    // Null guard: without a logged-in user the server answers 401, and
    // EventSource would keep retrying forever (the reconnect flood).
    if (!user) return;

    const source = new EventSource(url, { withCredentials: true });

    source.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (err) {
        console.error("[useSSE] could not parse event data:", event.data, err);
      }
    };

    source.onerror = (err) => {
      console.error("[useSSE] stream error:", err);
    };

    // Close the stream on logout, unmount, or when url/onMessage change.
    return () => source.close();
  }, [url, user, onMessage]);
}