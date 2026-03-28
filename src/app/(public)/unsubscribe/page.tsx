"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { unsubscribe } from "@/actions/subscribers";
import { CheckCircle2, AlertCircle } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      unsubscribe(token).then((result) => {
        if (result.error) setError(result.error);
        else setMessage(result.message ?? null);
      });
    } else {
      setError("Missing token");
    }
  }, [token]);

  return (
    <div className="max-w-sm mx-auto text-center py-12">
      {error && (
        <>
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="font-semibold text-[15px]">Something went wrong</p>
          <p className="text-[13px] text-muted-foreground mt-1">{error}</p>
        </>
      )}
      {message && (
        <>
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-[15px]">{message}</p>
          <p className="text-[13px] text-muted-foreground mt-1">
            You will no longer receive status updates.
          </p>
        </>
      )}
      {!error && !message && (
        <p className="text-[13px] text-muted-foreground">Processing...</p>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sm text-muted-foreground">Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
