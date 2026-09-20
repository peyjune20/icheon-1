import { z } from "zod";
import { TripInput } from "@/domain/models/trip-input";
import { ageLabel } from "@/domain/recommendation/itinerary-summary";

export const TripInputSchema = z.object({
  originText: z
    .string()
    .trim()
    .min(1, "출발 지역을 입력해 주세요.")
    .max(100, "출발 지역명이 너무 깁니다.")
    .default("현재 위치"),
  childAgeMonths: z.coerce.number().int().min(0, "개월수는 0 이상이어야 합니다.").max(120, "개월수는 120 이하이어야 합니다.").default(17),
  displayAge: z.string().max(30).default("2세"),
  strollerRequired: z.boolean().default(true),
  tripDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD).")
    .default("2025-09-05"),
  departureTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "출발 시간 형식이 올바르지 않습니다 (HH:mm).")
    .default("10:00"),
  arrivalInIcheon: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "이천 도착 시간 형식이 올바르지 않습니다 (HH:mm).")
    .default("12:00"),
  desiredDepartureFromIcheon: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "귀가 희망 시간 형식이 올바르지 않습니다 (HH:mm).")
    .default("17:30"),
  transport: z.enum(["CAR", "PUBLIC_TRANSPORT"]).default("CAR"),
  styles: z
    .array(z.enum(["NATURE", "PARENT_REST", "LOCAL_FOOD", "EXPERIENCE", "INDOOR", "PHOTO"]))
    .min(1, "여행 스타일을 최소 1개 이상 선택해 주세요.")
    .max(3, "여행 스타일은 최대 3개까지만 선택 가능합니다.")
    .default(["NATURE", "PARENT_REST"]),
  includeLunch: z.boolean().default(true),
  parentRestPriority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("HIGH"),
  napTimeStart: z.string().optional().default("13:30"),
  napTimeEnd: z.string().optional().default("15:00"),
  preferIndoor: z.boolean().optional(),
  weatherCondition: z.enum(["AUTO", "NORMAL", "HOT", "RAIN", "COLD"]).optional().default("AUTO"),
});

export type ValidatedTripInput = z.infer<typeof TripInputSchema>;

/**
 * Validate and normalize partial trip inputs safely
 */
export function validateAndNormalizeTripInput(input: Partial<TripInput>): TripInput {
  const result = TripInputSchema.safeParse(input);
  if (!result.success) {
    // If validation fails, provide descriptive error or fallback safely with detailed logs
    const errorDetails = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(`유효하지 않은 여행 입력값입니다: ${errorDetails}`);
  }
  return { ...result.data, displayAge: ageLabel(result.data.childAgeMonths) } as TripInput;
}
