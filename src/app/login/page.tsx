"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[340px]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center mb-4">
              <Lock className="h-5 w-5 text-background" />
            </div>
            <h1 className="text-lg font-semibold">Admin Login</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Enter your password to continue
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px]">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter admin password"
                  className="h-10"
                />
              </div>
              {state?.error && (
                <p className="text-red-600 dark:text-red-400 text-[13px]">{state.error}</p>
              )}
              <Button type="submit" className="w-full h-10" disabled={pending}>
                {pending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <footer className="border-t bg-background/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 text-center text-xs text-muted-foreground">
          Made by{" "}
          <a
            href="https://recurohq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline font-medium"
          >
            Recuro
          </a>
        </div>
      </footer>
    </div>
  );
}
