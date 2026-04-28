import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { SkillRef } from "@/lib/domain/types";

const skillsRoot = path.join(process.cwd(), "skills");

export type SkillAsset = SkillRef & {
  directory: string;
  body: string;
};

export async function listSkillAssets(): Promise<SkillAsset[]> {
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const assets = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => loadSkillAssetFromDirectory(entry.name)),
  );

  return assets.sort((a, b) => a.key.localeCompare(b.key));
}

export async function loadSkillAssets(refs: SkillRef[]): Promise<SkillAsset[]> {
  return Promise.all(
    refs.map((ref) => loadSkillAssetFromDirectory(`${ref.key}_${ref.version}`)),
  );
}

export function buildPromptSnapshot(skills: SkillAsset[]): string {
  return skills
    .map((skill) => `# ${skill.key}@${skill.version}\n\n${skill.body}`)
    .join("\n\n---\n\n");
}

async function loadSkillAssetFromDirectory(directory: string): Promise<SkillAsset> {
  const parsed = parseSkillDirectory(directory);
  const body = await readFile(path.join(skillsRoot, directory, "SKILL.md"), "utf8");

  return {
    ...parsed,
    directory,
    body,
  };
}

function parseSkillDirectory(directory: string): SkillRef {
  const match = directory.match(/^(?<key>.+)_(?<version>v\d+_\d+)$/);

  if (!match?.groups) {
    throw new Error(`Invalid skill directory name: ${directory}`);
  }

  return {
    key: match.groups.key,
    version: match.groups.version,
  };
}
