import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { siteConfig } from "@/config/site";

/**
 * Inquiry endpoint.
 * DEMO MODE: saves each submission as a local JSON file under
 * web/data/inquiries/ — no email is ever sent. Before launch,
 * replace the save block with your email/CRM integration and set
 * demoMode: false in config/site.ts.
 */

interface InquiryPayload {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  country?: string;
  productId?: string;
  quantity?: string;
  message?: string;
  consent?: boolean;
}

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>&]/g, "").slice(0, 2000);
}

export async function POST(req: NextRequest) {
  let payload: InquiryPayload;
  try {
    payload = (await req.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = sanitize(payload.name).trim();
  const email = sanitize(payload.email).trim();
  const consent = Boolean(payload.consent);

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  if (!consent) return NextResponse.json({ error: "Consent is required." }, { status: 400 });

  const record = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local",
    name,
    company: sanitize(payload.company),
    email,
    phone: sanitize(payload.phone),
    country: sanitize(payload.country),
    productId: sanitize(payload.productId),
    quantity: sanitize(payload.quantity),
    message: sanitize(payload.message),
    consent,
    demo: siteConfig.demoMode,
  };

  if (siteConfig.demoMode) {
    try {
      const dir = path.join(process.cwd(), "data", "inquiries");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, `${record.receivedAt.replace(/[:.]/g, "-")}-${record.id}.json`);
      await writeFile(file, JSON.stringify(record, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save demo inquiry:", err);
      return NextResponse.json(
        { error: "Could not save the inquiry locally. Check server logs." },
        { status: 500 }
      );
    }
  } else {
    // TODO pre-launch: integrate your email service / CRM here.
    return NextResponse.json(
      { error: "Inquiry service not configured." },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { ok: true, id: record.id, demo: siteConfig.demoMode },
    { status: 200 }
  );
}
