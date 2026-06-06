import { Notice } from "obsidian";
import type { App, TFile } from "obsidian";
import type { MobileDailyCaptureSettings } from "./types";

export async function appendCaptureToDailyNote(
  app: App,
  file: TFile,
  rawInput: string,
  settings: MobileDailyCaptureSettings,
): Promise<void> {
  const normalizedInput = rawInput.trim();
  if (!normalizedInput) {
    throw new Error("Capture content is empty.");
  }

  await app.vault.process(file, (content) => {
    const block = buildCaptureBlock(normalizedInput, settings);
    return insertIntoHeading(content, settings.targetHeading, block, settings.createHeadingIfMissing);
  });
}

function buildCaptureBlock(input: string, settings: MobileDailyCaptureSettings): string {
  const prefix = settings.capturePrefix;
  const lines = input.split(/\r?\n/);

  if (settings.writeMode === "plain") {
    const body = `${prefix}${lines.join("\n")}`.trimEnd();
    return `${body}\n`;
  }

  if (settings.writeMode === "bullet") {
    const [first, ...rest] = lines;
    const bulletLines = [`${prefix}- ${first}`];
    rest.forEach((line) => {
      bulletLines.push(`  ${line}`);
    });
    return `${bulletLines.join("\n")}\n`;
  }

  const [first, ...rest] = lines;
  const taskLines = [`${prefix}- [ ] ${first}`];
  rest.forEach((line) => {
    taskLines.push(`  ${line}`);
  });
  return `${taskLines.join("\n")}\n`;
}

function insertIntoHeading(
  content: string,
  headingName: string,
  block: string,
  createHeadingIfMissing: boolean,
): string {
  const normalized = normalizeNewlines(content);
  const heading = headingName.trim().replace(/^#+\s*/, "");
  const lines = normalized.length ? normalized.split("\n") : [];
  const headingRegex = new RegExp(`^(#{1,6})\\s+${escapeRegExp(heading)}\\s*$`);

  let startIndex = -1;
  let level = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(headingRegex);
    if (match) {
      startIndex = i;
      level = match[1].length;
      break;
    }
  }

  if (startIndex === -1) {
    if (!createHeadingIfMissing) {
      throw new Error(`Heading "${heading}" not found.`);
    }

    return appendHeadingBlock(normalized, heading, block);
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const headingMatch = lines[i].match(/^(#{1,6})\s+/);
    if (headingMatch && headingMatch[1].length <= level) {
      endIndex = i;
      break;
    }
  }

  const before = lines.slice(0, startIndex + 1);
  const sectionLines = lines.slice(startIndex + 1, endIndex);
  const after = lines.slice(endIndex);

  const mergedSection = normalizeSectionWithBlock(sectionLines, block);
  return [...before, ...mergedSection, ...after].join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function appendHeadingBlock(content: string, heading: string, block: string): string {
  const prefix = content.trimEnd();
  const parts = prefix ? [prefix, "", `## ${heading}`, "", block.trimEnd()] : [`## ${heading}`, "", block.trimEnd()];
  return `${parts.join("\n")}\n`;
}

function normalizeSectionWithBlock(sectionLines: string[], block: string): string[] {
  const section = [...sectionLines];

  while (section.length > 0 && section[0] === "") {
    section.shift();
  }

  while (section.length > 0 && section[section.length - 1] === "") {
    section.pop();
  }

  const result: string[] = [""];
  if (section.length > 0) {
    result.push(...section, "");
  }

  result.push(...block.trimEnd().split("\n"), "");
  return result;
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function notifyWriteError(error: unknown): void {
  const message = error instanceof Error ? error.message : "Unknown capture error.";
  new Notice(message);
}
