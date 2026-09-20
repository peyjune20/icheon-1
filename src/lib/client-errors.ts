export class UserFacingError extends Error {
  constructor(message: string, public code = "UNAVAILABLE") { super(message); this.name = "UserFacingError"; }
}
export function friendlyError(error: unknown, fallback: string) {
  if (error instanceof UserFacingError) return error.message;
  console.error("Bebe request failed", error);
  return fallback;
}
// Never parse a static-host 404/fallback HTML page as JSON or expose its body.
export async function readJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok || !/\bapplication\/(?:[\w.+-]*\+)?json\b/i.test(response.headers.get("Content-Type") || "")) {
    console.error("Unexpected API response", { status: response.status, contentType: response.headers.get("Content-Type") });
    throw new UserFacingError("서비스 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.");
  }
  try { return await response.json() as T; }
  catch { throw new UserFacingError("응답을 확인하지 못했어요. 잠시 후 다시 시도해 주세요."); }
}
