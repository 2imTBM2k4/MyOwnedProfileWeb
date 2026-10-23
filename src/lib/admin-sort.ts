export function sortRows<T>(rows: T[], field: keyof T | null, direction: "asc" | "desc"): T[] {
  if (!field) return rows;
  return [...rows].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    const emptyLeft = left == null || String(left).trim() === "";
    const emptyRight = right == null || String(right).trim() === "";
    if (emptyLeft || emptyRight) return Number(emptyLeft) - Number(emptyRight);
    const comparison = typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right), "vi", { numeric: true, sensitivity: "base" });
    return direction === "asc" ? comparison : -comparison;
  });
}
