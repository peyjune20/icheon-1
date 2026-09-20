// Temporary editing draft only. Durable saved plans live in D1 via /api/plan.
export type ActiveCourse = { ids: string[]; query: string };
const key = "bebe-active-course-draft";
export function readActiveCourse(): ActiveCourse | null {
  try { const data = JSON.parse(sessionStorage.getItem(key) || "null"); return data && Array.isArray(data.ids) && data.ids.length <= 30 && data.ids.every((id: unknown) => typeof id === "string") && typeof data.query === "string" ? data : null; } catch { return null; }
}
export function writeActiveCourse(plan: ActiveCourse) { try { sessionStorage.setItem(key, JSON.stringify(plan)); } catch { /* Link copy and server persistence remain available. */ } }
