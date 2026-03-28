"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribe, verifySubscriber } from "@/actions/subscribers";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

function SubscribeForm() {
  const searchParams = useSearchParams();
  const verifyToken = searchParams.get("verify");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (verifyToken) {
      verifySubscriber(verifyToken).then((result) => {
        if (result.error) setError(result.error);
        else setMessage(result.message ?? null);
      });
    }
  }, [verifyToken]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    const result = await subscribe(formData);
    if (result.error) setError(result.error);
    else setMessage(result.message ?? null);
  }

  if (verifyToken) {
    return (
      <div className="max-w-sm mx-auto text-center py-12">
        {error && (
          <>
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="font-semibold text-[15px]">Verification Failed</p>
            <p className="text-[13px] text-muted-foreground mt-1">{error}</p>
          </>
        )}
        {message && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-[15px]">{message}</p>
            <p className="text-[13px] text-muted-foreground mt-1">
              You will now receive status updates by email.
            </p>
          </>
        )}
        {!error && !message && (
          <p className="text-[13px] text-muted-foreground">Verifying...</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-12">
      <div className="text-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center mx-auto mb-4">
          <Mail className="h-5 w-5 text-background" />
        </div>
        <h1 className="text-lg font-semibold">Subscribe to Updates</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Get notified when we create or resolve incidents.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <form action={handleSubmit} className="flex gap-2">
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-10"
          />
          <Button type="submit" className="h-10 px-5 flex-shrink-0">
            Subscribe
          </Button>
        </form>
        {error && (
          <p className="text-red-600 dark:text-red-400 text-[12px] mt-2">{error}</p>
        )}
        {message && (
          <p className="text-emerald-600 dark:text-emerald-400 text-[12px] mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sm text-muted-foreground">Loading...</div>}>
      <SubscribeForm />
    </Suspense>
  );
}
