import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/server/auth";
import { listSkillAssets } from "@/lib/server/skills";

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const skills = await listSkillAssets();

  return NextResponse.json({
    skills: skills.map((skill) => ({
      key: skill.key,
      version: skill.version,
      directory: skill.directory,
    })),
  });
}
