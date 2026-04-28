import { NextResponse } from "next/server";
import {
  fetchRootApi,
  rootApiErrorMessage,
  type RootCampaign,
  type RootContentAsset,
  type RootPublishPost,
} from "@/lib/workbench/api-client";
import { fallbackCreatedPublishPost, fallbackPublishPosts } from "@/lib/workbench/fallback";
import { mapPublishPostToWorkbench } from "@/lib/workbench/mappings";
import type { CalendarEvent } from "@/lib/workbench/types";

function mapChannelToRoot(channel?: string) {
  const value = (channel ?? "").toLowerCase();
  if (value.includes("instagram")) return "instagram";
  if (value.includes("tiktok")) return "tiktok";
  if (value.includes("short") || value.includes("youtube")) return "youtube";
  if (value.includes("newsletter") || value.includes("email")) return "email";
  if (value.includes("linkedin")) return "other";
  return "other";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await fetchRootApi<{ publishPosts: RootPublishPost[]; total: number; limit: number; offset: number }>(
      `/api/publish-posts${url.search}`,
    );

    return NextResponse.json({
      publishPosts: data.publishPosts.map(mapPublishPostToWorkbench),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackPublishPosts(rootApiErrorMessage(error)));
  }
}

export async function POST(request: Request) {
  let input: Partial<CalendarEvent> & { assetId?: string; campaignId?: string } = {};

  try {
    input = await request.json();
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + (input.day ?? 1));
    const ids = await ensurePublishTarget(input);

    const data = await fetchRootApi<{ publishPost: RootPublishPost }>("/api/publish-posts", {
      method: "POST",
      body: JSON.stringify({
        campaignId: ids.campaignId,
        assetId: ids.assetId,
        channel: mapChannelToRoot(input.channel),
        scheduledAt: scheduledAt.toISOString(),
        trackingCode: input.title,
      }),
    });

    return NextResponse.json({
      publishPost: mapPublishPostToWorkbench(data.publishPost),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackCreatedPublishPost(input, rootApiErrorMessage(error)));
  }
}

async function ensurePublishTarget(input: Partial<CalendarEvent> & { assetId?: string; campaignId?: string }) {
  if (input.assetId && input.campaignId) {
    return { assetId: input.assetId, campaignId: input.campaignId };
  }

  const campaign =
    input.campaignId ??
    (
      await fetchRootApi<{ campaign: RootCampaign }>("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name: "Workbench Publishing Pipeline",
          objective: "Record human-scheduled content publish slots for the P0 loop.",
          source: "workbench",
          owner: "founder",
          tags: ["p0", "publishing-calendar"],
        }),
      })
    ).campaign.id;

  if (input.assetId) {
    return { assetId: input.assetId, campaignId: campaign };
  }

  const asset = await fetchRootApi<{ asset: RootContentAsset }>("/api/content-assets", {
    method: "POST",
    body: JSON.stringify({
      campaignId: campaign,
      title: input.title ?? "Scheduled content slot",
      format: input.type === "newsletter" ? "email" : "short_video",
      channel: mapChannelToRoot(input.channel),
      brief: "Created from the Workbench publishing calendar.",
      callToAction: "Start Safety Intake",
      source: input.title,
      tags: ["calendar"],
    }),
  });

  return { assetId: asset.asset.id, campaignId: campaign };
}
