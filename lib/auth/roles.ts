export function hasRole(role: string | null | undefined, expected: string) {
  return role?.split(",").some((value) => value.trim() === expected) ?? false;
}
