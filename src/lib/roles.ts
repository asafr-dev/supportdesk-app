import { Role } from "@prisma/client";

export const ROLE_VALUES = Object.values(Role) as Role[];

export const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string }> = [
  { value: Role.USER, label: "USER" },
  { value: Role.AGENT, label: "AGENT" },
  { value: Role.ADMIN, label: "ADMIN" }
] as const;

export function roleLabel(role: Role): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}
