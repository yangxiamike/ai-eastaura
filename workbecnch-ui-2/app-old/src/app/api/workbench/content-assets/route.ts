import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootCampaign, type RootContentAsset } from "@/lib/workbench/api-client";
import { fallbackContentAssets, fallbackCreatedContentAsset } from "@/lib/workbench/fallback";
import { mapContentAssetToWorkbench } from "@/lib/workbench/mappings";
import type { ContentItem } from "@/lib/workbench/types";

function mapWorkbenchTypeToRoot(type?: string) {
  const map: Record<string, string> = {
    short_video_script: "short_video",
    reels_script: "short_video",
    linkedin_post: "article",
    newsletter: "email",
    blog: "article",
  };

  return map[type ?? ""] ?? "short_video";
}

function mapWorkbenchChannelToRoot(channel?: string) {
  const value = (channel ?? "").toLowerCase();
  if (value.includes("instagram")) return "instagram";
  if (value.includes("tiktok")) return "tiktok";
  if (value.includes("youtube") || value.includes("shorts")) return "youtube";
  if (value.includes("newsletter") || value.includes("email")) return "email";
  if (value.includes("blog") || value.includes("website")) return "website";
  return "other";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await fetchRootApi<{ assets: RootContentAsset[]; total: number; limit: number; offset: number }>(
      `/api/content-assets${url.search}`,
    );

    return NextResponse.json({
      assets: data.assets.map(mapContentAssetToWorkbench),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackContentAssets(rootApiErrorMessage(error)));
  }
}

export async function POST(request: Request) {
  let input: Partial<ContentItem> & { brief?: string; campaignId?: string } = {};

  try {
    input = await request.json();
    const campaignId = await ensureCampaignId(input);
    const data = await fetchRootApi<{ asset: RootContentAsset }>("/api/content-assets", {
      method: "POST",
      body: JSON.stringify({
        campaignId,
        title: input.title ?? "New content draft",
        format: mapWorkbenchTypeToRoot(input.type),
        channel: mapWorkbenchChannelToRoot(input.channel),
        brief: input.brief ?? input.performanceNotes ?? input.body,
        body: input.body,
        callToAction: input.cta,
        source: input.sourceCode,
        tags: input.topics ?? [],
      }),
    });

    return NextResponse.json({
      asset: mapContentAssetToWorkbench(data.asset),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackCreatedContentAsset(input, rootApiErrorMessage(error)));
  }
}

async function ensureCampaignId(input: Partial<ContentItem> & { campaignId?: string }) {
  if (input.campaignId) {
    return input.campaignId;
  }

  const campaignName = input.campaign || "Workbench Content Pipeline";
  const data = await fetchRootApi<{ campaign: RootCampaign }>("/api/campaigns", {
    method: "POST",
    body: JSON.stringify({
      name: campaignName,
      objective: "Run the P0 content production loop from draft to reviewed publish record.",
      source: "workbench",
      owner: "founder",
      tags: ["p0", "content-pipeline"],
    }),
  });

  return data.campaign.id;
}
