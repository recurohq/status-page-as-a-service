"use server";

import { createSession, destroySession, ADMIN_PASSWORD } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(_prev: unknown, formData: FormData) {
  const password = formData.get("password") as string;

  if (password !== ADMIN_PASSWORD) {
    return { error: "Invalid password" };
  }

  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
