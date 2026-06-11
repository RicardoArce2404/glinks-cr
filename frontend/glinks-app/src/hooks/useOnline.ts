import { useEffect, useState } from "react";

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  const [forced, setForced] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setOnline(navigator.onLine);

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const effective = forced ?? online;
  return {
    online: effective,
    toggleForce: () => setForced((f) => (f === null ? !online : !f)),
  };
}