"use server";

import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ServiceStatus } from "@/lib/utils";

export async function getServices() {
  return db.select().from(services).orderBy(asc(services.displayOrder)).all();
}

export async function getVisibleServices() {
  return db
    .select()
    .from(services)
    .where(eq(services.visible, true))
    .orderBy(asc(services.displayOrder))
    .all();
}

export async function getService(id: number) {
  return db.select().from(services).where(eq(services.id, id)).get();
}

export async function createService(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  const maxOrder = db
    .select({ max: services.displayOrder })
    .from(services)
    .get();

  db.insert(services)
    .values({
      name,
      description,
      displayOrder: (maxOrder?.max ?? -1) + 1,
    })
    .run();

  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function updateService(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const status = formData.get("status") as ServiceStatus;
  const visible = formData.get("visible") === "on";

  db.update(services)
    .set({ name, description, status, visible })
    .where(eq(services.id, id))
    .run();

  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function updateServiceStatus(id: number, status: ServiceStatus) {
  db.update(services).set({ status }).where(eq(services.id, id)).run();
  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function deleteService(id: number) {
  db.delete(services).where(eq(services.id, id)).run();
  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function reorderServices(orderedIds: number[]) {
  orderedIds.forEach((id, index) => {
    db.update(services)
      .set({ displayOrder: index })
      .where(eq(services.id, id))
      .run();
  });
  revalidatePath("/admin/services");
  revalidatePath("/");
}
