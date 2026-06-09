import { App, PluginSettingTab, Setting } from "obsidian";
import type MobileDailyCapturePlugin from "../main";
import type { MobileDailyCaptureSettings } from "./types";
import { t } from "./i18n";

export const DEFAULT_SETTINGS: MobileDailyCaptureSettings = {
  language: "auto",
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
    const copy = t(settings);

    containerEl.empty();
    new Setting(containerEl).setName(copy.pluginTitle).setHeading();
    containerEl.createEl("p", { text: copy.settingsIntro });

    new Setting(containerEl)
      .setName(copy.languageName)
      .setDesc(copy.languageDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("auto", copy.languageOptions.auto)
          .addOption("zh", copy.languageOptions.zh)
          .addOption("en", copy.languageOptions.en)
          .setValue(settings.language)
          .onChange(async (value) => {
            settings.language = value as MobileDailyCaptureSettings["language"];
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    new Setting(containerEl)
      .setName(copy.dailyNotePathFormatName)
      .setDesc(copy.dailyNotePathFormatDesc)
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
      .setName(copy.templatePathName)
      .setDesc(copy.templatePathDesc)
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
      .setName(copy.targetHeadingName)
      .setDesc(copy.targetHeadingDesc)
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
      .setName(copy.markdownHeadingLevelName)
      .setDesc(copy.markdownHeadingLevelDesc)
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
      .setName(copy.createHeadingIfMissingName)
      .setDesc(copy.createHeadingIfMissingDesc)
      .addToggle((toggle) =>
        toggle.setValue(settings.createHeadingIfMissing).onChange(async (value) => {
          settings.createHeadingIfMissing = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName(copy.writeModeName)
      .setDesc(copy.writeModeDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("plain", copy.writeModeOptions.plain)
          .addOption("bullet", copy.writeModeOptions.bullet)
          .addOption("task", copy.writeModeOptions.task)
          .setValue(settings.writeMode)
          .onChange(async (value) => {
            settings.writeMode = value as MobileDailyCaptureSettings["writeMode"];
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(copy.capturePrefixName)
      .setDesc(copy.capturePrefixDesc)
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
      .setName(copy.openNoteAfterSaveName)
      .setDesc(copy.openNoteAfterSaveDesc)
      .addToggle((toggle) =>
        toggle.setValue(settings.openAfterSave).onChange(async (value) => {
          settings.openAfterSave = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl).addButton((button) =>
      button.setButtonText(copy.resetButtonText).onClick(async () => {
        if (!confirm(copy.resetConfirmMessage)) {
          return;
        }

        this.plugin.settings = { ...DEFAULT_SETTINGS };
        await this.plugin.saveSettings();
        this.display();
      }),
    );
  }
}
