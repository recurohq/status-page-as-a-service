"use server";

import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/notifications/email";

function isValidEmail(email: string): boolean {
  return !!email && email.includes("@");
}

export async function getSubscribers() {
  return db
    .select({
      id: subscribers.id,
      email: subscribers.email,
      verified: subscribers.verified,
      createdAt: subscribers.createdAt,
    })
    .from(subscribers)
    .all();
}

export async function subscribe(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { error: "Invalid email address" };
  }

  const existing = db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .get();

  if (existing) {
    if (existing.verified) {
      return { message: "You are already subscribed." };
    }
    // Resend verification
    sendVerificationEmail(email, existing.token).catch(console.error);
    return { message: "Verification email resent. Check your inbox." };
  }

  const token = generateToken();
  db.insert(subscribers).values({ email, token }).run();

  sendVerificationEmail(email, token).catch(console.error);

  return { message: "Check your email to confirm your subscription." };
}

export async function verifySubscriber(token: string) {
  const sub = db
    .select()
    .from(subscribers)
    .where(eq(subscribers.token, token))
    .get();

  if (!sub) return { error: "Invalid token" };

  db.update(subscribers)
    .set({ verified: true })
    .where(eq(subscribers.id, sub.id))
    .run();

  return { message: "Subscription confirmed!" };
}

export async function unsubscribe(token: string) {
  const sub = db
    .select()
    .from(subscribers)
    .where(eq(subscribers.token, token))
    .get();

  if (!sub) return { error: "Invalid token" };

  db.delete(subscribers).where(eq(subscribers.id, sub.id)).run();
  return { message: "You have been unsubscribed." };
}

export async function deleteSubscriber(id: number) {
  db.delete(subscribers).where(eq(subscribers.id, id)).run();
  revalidatePath("/admin/subscribers");
}

export async function addSubscriber(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { error: "Invalid email address" };
  }

  const token = generateToken();
  try {
    db.insert(subscribers).values({ email, token, verified: true }).run();
  } catch {
    return { error: "Email already exists" };
  }

  revalidatePath("/admin/subscribers");
  return { message: "Subscriber added" };
}

export async function exportSubscribersCSV() {
  const all = db.select().from(subscribers).all();
  const lines = ["email,verified,created_at"];
  for (const s of all) {
    lines.push(`${s.email},${s.verified},${s.createdAt}`);
  }
  return lines.join("\n");
}
