import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(payload: unknown) {
  return new Request("http://localhost/api/sponsor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/sponsor", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it("returns 400 for an invalid body", async () => {
    const res = await POST(makeRequest({ name: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 and { ok: true } for a valid body with no RESEND_API_KEY", async () => {
    const res = await POST(
      makeRequest({
        name: "Acme Co",
        company: "Acme",
        email: "partner@acme.com",
        phone: "+961 1 234 567",
        type: "Financial",
        message: "We'd love to support the expedition.",
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
  });
});
