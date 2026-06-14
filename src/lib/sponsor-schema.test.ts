import { describe, it, expect } from "vitest";
import { sponsorSchema } from "./sponsor-schema";

describe("sponsorSchema", () => {
  it("rejects bad email and empty name", () => {
    expect(sponsorSchema.safeParse({ name:"", email:"x", message:"hi", type:"Financial" }).success).toBe(false);
  });
  it("accepts a valid submission with optional company/phone", () => {
    const r = sponsorSchema.safeParse({ name:"A", email:"a@b.com", message:"Let's talk", type:"Equipment" });
    expect(r.success).toBe(true);
  });
});
