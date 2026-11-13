import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

// A key collision is astronomically unlikely, but if one happens, retry with fresh keys.
const MAX_KEY_ATTEMPTS = 3;

// Unique index from the business_owner_unique migration: one business per owner.
const OWNER_UNIQUE_INDEX = "businesses_owner_id_key";


const businessSchema = z.object({
  businessName: z
    .string("Business name is required")
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(60, "Business name must be at most 60 characters"),
});

// 24 bytes = 192 bits for the public key, 32 bytes = 256 bits for the secret.
// At these sizes collisions are practically impossible; the unique indexes on
// public_key / secret_key_hash are the backstop.
function generateApiKeys() {
  const publicKey = `pk_${randomBytes(24).toString("base64url")}`;
  const secretKey = `sk_${randomBytes(32).toString("base64url")}`;
  // The secret is high-entropy random, so a fast unsalted SHA-256 is enough here
  // (unlike passwords, it can't be brute-forced from the hash).
  const secretKeyHash = createHash("sha256").update(secretKey).digest("hex");
  return { publicKey, secretKey, secretKeyHash };
}

export async function POST(request: Request) {
  // 1. Identify the user from the JWT cookie, never from the request body.
  const session = await getSession();
  if (!session?.userId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { userId } = session;
  console.log(userId);
  

  // 2. Validate the business name.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const result = businessSchema.safeParse(body);
  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors;
    return Response.json(
      { message: errors.businessName?.[0] ?? "Validation failed", errors },
      { status: 422 },
    );
  }
  const { businessName } = result.data;

  // 3 + 4. Generate the keys, hash the secret, and save the business.
  // Only secretKeyHash is stored; secretKey is returned once below and can't be recovered.
  for (let attempt = 1; attempt <= MAX_KEY_ATTEMPTS; attempt++) {
    const { publicKey, secretKey, secretKeyHash } = generateApiKeys();

    try {
      const business = await prisma.business.create({
        data: { name: businessName, ownerId: userId, publicKey, secretKeyHash },
        select: {
  id: true,
  name: true,
  ownerId: true,
  publicKey: true,
  secretKeyHash: true,
},
      });
     console.log(business);
     
      return Response.json(
        { message: "Business created", business, publicKey, secretKey },
        { status: 201 },
      );
    } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // The constraint name is only reported in the driver adapter's error details.
          const adapterError = error.meta?.driverAdapterError as
            | { cause?: { constraint?: { index?: string } } }
            | undefined;
          // The user already has a business: a conflict, not a key collision.
          if (adapterError?.cause?.constraint?.index === OWNER_UNIQUE_INDEX) {
            return Response.json({ message: "You already have a business." }, { status: 409 });
          }
          // P2002 on public_key / secret_key_hash: try new keys.
          if (attempt < MAX_KEY_ATTEMPTS) continue;
        }
        // P2003 = foreign key violation: the token's user no longer exists.
        if (error.code === "P2003") {
          return Response.json({ message: "Unauthorized" }, { status: 401 });
        }
      }

      // The raw secret key is never passed to Prisma, so it can't end up in this log.
      console.error("Business creation failed", error);
      break;
    }
  }

  return Response.json({ message: "Could not create business. Try again." }, { status: 500 });
}
