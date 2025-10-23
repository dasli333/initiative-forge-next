import { z } from "zod";

/**
 * Schema for creating a new campaign
 * Validates the campaign name from request body
 */
export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name cannot be empty").max(255, "Campaign name is too long"),
});

/**
 * Schema for updating a campaign
 * Validates the campaign name from request body
 */
export const updateCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name cannot be empty").max(255, "Campaign name is too long"),
});
