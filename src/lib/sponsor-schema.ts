import { z } from "zod";

import { SPONSOR } from "./constants";

// Build the sponsorship-type enum from the single source of truth in constants.
const SPONSOR_TYPES = SPONSOR.types as readonly [string, ...string[]];

/**
 * Validation schema for the sponsorship inquiry form.
 * Shared between the client form (instant feedback) and the route handler.
 */
export const sponsorSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  company: z.string().trim().optional(),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().optional(),
  type: z.enum(SPONSOR_TYPES, {
    message: "Please choose a sponsorship type.",
  }),
  message: z.string().trim().min(1, "Please tell us a little about your offer."),
});

export type SponsorInput = z.infer<typeof sponsorSchema>;
