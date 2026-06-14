import { sponsorSchema } from "@/lib/sponsor-schema";

export const runtime = "nodejs";

// Where sponsorship inquiries are delivered when an email provider is wired up.
const NOTIFY_TO = "aliabdelhadi64@gmail.com";
// Resend requires a verified sender; this is a safe placeholder until a real
// domain is configured. Swap for an address on a verified domain in prod.
const NOTIFY_FROM = "Sponsorship <onboarding@resend.dev>";

export async function POST(req: Request) {
  // 1. Parse the JSON body defensively.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, errors: { _form: ["Invalid request body."] } },
      { status: 400 },
    );
  }

  // 2. Validate against the shared schema.
  const parsed = sponsorSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // 3. Notify. Use the Resend REST API via fetch (no extra dependency) when a
  //    key is configured; otherwise just log the inquiry for local dev.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: NOTIFY_FROM,
          to: [NOTIFY_TO],
          reply_to: data.email,
          subject: "New sponsorship inquiry",
          text: [
            "New sponsorship inquiry from the Jawad Shalhoub site.",
            "",
            `Name:    ${data.name}`,
            `Company: ${data.company || "—"}`,
            `Email:   ${data.email}`,
            `Phone:   ${data.phone || "—"}`,
            `Type:    ${data.type}`,
            "",
            "Message:",
            data.message,
          ].join("\n"),
        }),
      });
      // fetch only throws on network errors, not HTTP error statuses — surface
      // a rejected send (e.g. unverified sender/recipient) instead of swallowing it.
      if (!res.ok) {
        console.error(
          `[sponsor] Resend rejected the email (${res.status}):`,
          await res.text(),
        );
      }
    } catch (err) {
      // Never fail the user's submission because the email provider hiccuped.
      console.error("[sponsor] failed to send notification email", err);
    }
  } else {
    console.log("[sponsor] new inquiry (no RESEND_API_KEY configured)", data);
  }

  return Response.json({ ok: true }, { status: 200 });
}
