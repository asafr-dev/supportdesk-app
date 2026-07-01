"use server";

import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { parseWithSchema, pickFormStrings } from "@/lib/forms";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/permissions";

const input = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(Role)
});

export async function setUserRoleAction(formData: FormData) {
  const me = await requireUser();
  if (!isAdmin(me)) throw new Error("FORBIDDEN");

  const raw = pickFormStrings(formData, ["userId", "role"] as const);

  const parsed = parseWithSchema(input, raw);
  if (!parsed.ok) return;

  // Prevent demoting yourself to avoid "lockout" in the demo
  if (parsed.data.userId === me.id && parsed.data.role !== Role.ADMIN) {
    redirect("/admin/users");
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role }
  });

  redirect("/admin/users");
}
