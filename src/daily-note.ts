import { TFile, TFolder, moment, normalizePath } from "obsidian";
import type { App } from "obsidian";
import type { MobileDailyCaptureSettings } from "./types";

type DateFormatter = {
  format(format: string): string;
};

const now = moment as unknown as () => DateFormatter;

export function buildDailyNotePath(settings: MobileDailyCaptureSettings, date = now()): string {
  const formattedPath = renderDatePathTemplate(settings.dailyNotePathFormat.trim() || "YYYY-MM-DD", date);
  const withExtension = formattedPath.endsWith(".md") ? formattedPath : `${formattedPath}.md`;
  return normalizePath(withExtension);
}

export async function ensureDailyNote(app: App, settings: MobileDailyCaptureSettings): Promise<TFile> {
  const path = buildDailyNotePath(settings);
  const existing = getFileAtPath(app, path);

  if (existing) {
    return existing;
  }

  const folderPath = parentFolder(path);
  if (folderPath) {
    await ensureFolder(app, folderPath);
  }

  const template = await readTemplate(app, settings, path);
  return await app.vault.create(path, template);
}

function renderDatePathTemplate(template: string, date: DateFormatter): string {
  return template.replace(/YYYY|YY|MM|DD/g, (token) => date.format(token));
}

async function readTemplate(app: App, settings: MobileDailyCaptureSettings, dailyNotePath: string): Promise<string> {
  const templatePath = withMarkdownExtension(settings.dailyNoteTemplatePath.trim());
  if (!templatePath) {
    return "";
  }

  const templateFile = getFileAtPath(app, templatePath);
  if (!templateFile) {
    return "";
  }

  return renderTemplateVariables(await app.vault.read(templateFile), dailyNotePath);
}

function renderTemplateVariables(template: string, dailyNotePath: string, date = now()): string {
  const title = dailyNotePath.split("/").pop()?.replace(/\.md$/, "") ?? "";

  return template
    .replace(/\{\{date(?::([^}]+))?\}\}/g, (_match, format: string | undefined) =>
      date.format(format || "YYYY-MM-DD"),
    )
    .replace(/\{\{time(?::([^}]+))?\}\}/g, (_match, format: string | undefined) =>
      date.format(format || "HH:mm"),
    )
    .replace(/\{\{title\}\}/g, title);
}

function withMarkdownExtension(path: string): string {
  if (!path) {
    return "";
  }

  const normalized = normalizePath(path);
  return normalized.endsWith(".md") ? normalized : `${normalized}.md`;
}

function parentFolder(path: string): string {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
}

function getFileAtPath(app: App, path: string): TFile | null {
  const entry = app.vault.getAbstractFileByPath(path);
  return entry instanceof TFile ? entry : null;
}

async function ensureFolder(app: App, folderPath: string): Promise<void> {
  const normalized = normalizePath(folderPath);
  const parts = normalized.split("/").filter(Boolean);
  let currentPath = "";

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const folder = app.vault.getAbstractFileByPath(currentPath);

    if (!folder) {
      await app.vault.createFolder(currentPath);
      continue;
    }

    if (!(folder instanceof TFolder)) {
      throw new Error(`Path exists and is not a folder: ${currentPath}`);
    }
  }
}
