import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("CLERK_WEBHOOK_SECRET not set — skipping webhook verification");
  }

  const headerPayload = req.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const body = await req.text();

  // Verify webhook signature
  if (webhookSecret) {
    const wh = new Webhook(webhookSecret);
    try {
      wh.verify(body, {
        "svix-id": svix_id ?? "",
        "svix-timestamp": svix_timestamp ?? "",
        "svix-signature": svix_signature ?? "",
      });
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const event: WebhookEvent = JSON.parse(body);

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const email = email_addresses[0]?.email_address;

      if (!email) break;

      await db.user
        .create({
          data: {
            clerkId: id,
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || null,
            imageUrl: image_url || null,
          },
        })
        .catch((err: unknown) => {
          // Handle case where user already exists (idempotent)
          if ((err as { code?: string }).code !== "P2002") throw err;
        });

      console.log(`✅ User created in DB: ${email}`);
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const email = email_addresses[0]?.email_address;

      await db.user
        .update({
          where: { clerkId: id },
          data: {
            email: email ?? undefined,
            name: [first_name, last_name].filter(Boolean).join(" ") || null,
            imageUrl: image_url || null,
          },
        })
        .catch(console.error);

      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      if (!id) break;

      await db.user
        .delete({ where: { clerkId: id } })
        .catch(console.error);

      console.log(`🗑️ User deleted from DB: ${id}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
