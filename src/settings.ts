import { App, PluginSettingTab, Setting } from "obsidian";
import type MobileDailyCapturePlugin from "../main";
import type { MobileDailyCaptureSettings } from "./types";

export const DEFAULT_SETTINGS: MobileDailyCaptureSettings = {
  dailyNotePathFormat: "0. 周期笔记/YYYY/Daily/MM/YYYY-MM-DD",
  dailyNoteTemplatePath: "0. 周期笔记/Templates/Daily",
  targetHeading: "日常记录",
  markdownHeadingLevel: "2",
  createHeadingIfMissing: true,
  capturePrefix: "",
  writeMode: "plain",
  openAfterSave: false,
};

export class MobileDailyCaptureSettingTab extends PluginSettingTab {
  plugin: MobileDailyCapturePlugin;

  constructor(app: App, plugin: MobileDailyCapturePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.settings;

    containerEl.empty();
    containerEl.createEl("h2", { text: "拾句 Shiju" });
    containerEl.createEl("p", {
      text: "Configure where quick captures should be stored in today's daily note.",
    });

    new Setting(containerEl)
      .setName("Daily note path format")
      .setDesc("Vault-relative path template for today's note. Supports YYYY, YY, MM, DD.")
      .addText((text) =>
        text
          .setPlaceholder("0. 周期笔记/YYYY/Daily/MM/YYYY-MM-DD")
          .setValue(settings.dailyNotePathFormat)
          .onChange(async (value) => {
            settings.dailyNotePathFormat = value.trim() || DEFAULT_SETTINGS.dailyNotePathFormat;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Template path")
      .setDesc("Vault-relative template note used when today's daily note does not exist.")
      .addText((text) =>
        text
          .setPlaceholder("0. 周期笔记/Templates/Daily")
          .setValue(settings.dailyNoteTemplatePath)
          .onChange(async (value) => {
            settings.dailyNoteTemplatePath = value.trim() || DEFAULT_SETTINGS.dailyNoteTemplatePath;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Target heading")
      .setDesc("The heading under which captured text will be inserted.")
      .addText((text) =>
        text
          .setPlaceholder("日常记录")
          .setValue(settings.targetHeading)
          .onChange(async (value) => {
            settings.targetHeading = value.trim() || DEFAULT_SETTINGS.targetHeading;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Markdown heading level")
      .setDesc("Choose which heading level the toolbar title button should insert.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("1", "H1")
          .addOption("2", "H2")
          .addOption("3", "H3")
          .addOption("4", "H4")
          .addOption("5", "H5")
          .addOption("6", "H6")
          .setValue(settings.markdownHeadingLevel)
          .onChange(async (value) => {
            settings.markdownHeadingLevel = value as MobileDailyCaptureSettings["markdownHeadingLevel"];
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Create heading if missing")
      .setDesc("Automatically add the target heading when it does not exist yet.")
      .addToggle((toggle) =>
        toggle.setValue(settings.createHeadingIfMissing).onChange(async (value) => {
          settings.createHeadingIfMissing = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Write mode")
      .setDesc("Choose how captured text should be written into the note.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("plain", "Plain text")
          .addOption("bullet", "Bullet list")
          .addOption("task", "Task list")
          .setValue(settings.writeMode)
          .onChange(async (value) => {
            settings.writeMode = value as MobileDailyCaptureSettings["writeMode"];
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Capture prefix")
      .setDesc("Text to prepend before the formatted capture block.")
      .addText((text) =>
        text
          .setPlaceholder("")
          .setValue(settings.capturePrefix)
          .onChange(async (value) => {
            settings.capturePrefix = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Open note after save")
      .setDesc("Reveal today's note after a capture is written.")
      .addToggle((toggle) =>
        toggle.setValue(settings.openAfterSave).onChange(async (value) => {
          settings.openAfterSave = value;
          await this.plugin.saveSettings();
        }),
      );
  }
}
