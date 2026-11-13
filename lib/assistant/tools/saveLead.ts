import { prisma } from "@/lib/db";
import { leadSchema } from "../schemas/leadSchema";

export async function saveLead(
  args: unknown,
  businessId: string,
  sessionId: string
) {
  const parsed = leadSchema.safeParse(args);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  try {
    await prisma.lead.create({
      data: {
        ...parsed.data,
        businessId,
        sessionId,
      },
    });

    return {
      success: true,
      message: "LEAD_SAVED",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to save lead",
    };
  }
}