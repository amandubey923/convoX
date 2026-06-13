import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("========== WEBHOOK HIT ==========");

  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    console.log("Secret Exists:", !!signingSecret);

    if (!signingSecret) {
      console.log("Webhook Secret Missing");
      return res.status(503).json({
        message: "Webhook secret is not provided",
      });
    }

    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body);

    const request = new Request(
      "http://internal/webhooks/clerk",
      {
        method: "POST",
        headers: new Headers(req.headers),
        body: payload,
      }
    );

    const evt = await verifyWebhook(request, {
      signingSecret,
    });

    console.log("Event Type:", evt.type);
    console.log("Event ID:", evt.data?.id);

    if (
      evt.type === "user.created" ||
      evt.type === "user.updated"
    ) {
      const u = evt.data;

      const email =
        u.email_addresses?.find(
          (e) => e.id === u.primary_email_address_id
        )?.email_address ||
        u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name]
          .filter(Boolean)
          .join(" ") ||
        u.username ||
        email?.split("@")[0];

      console.log("Creating User:", {
        clerkId: u.id,
        email,
        fullName,
      });

      const user = await User.findOneAndUpdate(
        { clerkId: u.id },
        {
          clerkId: u.id,
          email,
          fullName,
          profilePic: u.image_url,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log("User Saved:", user);
    }

    if (evt.type === "user.deleted") {
      console.log("Deleting User:", evt.data.id);

      await User.findOneAndDelete({
        clerkId: evt.data.id,
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("WEBHOOK ERROR:");
    console.error(error);

    return res.status(400).json({
      message: "Webhook verification failed",
      error: error.message,
    });
  }
});

export default router;