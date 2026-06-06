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
      text: "配置速记内容要写入到哪里。Configure where quick captures should be stored in today's daily note.",
    });

    new Setting(containerEl)
      .setName("每日笔记路径格式 / Daily note path format")
      .setDesc("今日日记的 vault 相对路径模板，支持 YYYY、YY、MM、DD。Vault-relative path template for today's note.")
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
      .setName("模板路径 / Template path")
      .setDesc("今日日记不存在时使用的模板路径。Vault-relative template note used when today's daily note does not exist.")
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
      .setName("目标标题 / Target heading")
      .setDesc("速记内容会插入到这个标题下，不需要写前导 #。The heading under which captured text will be inserted.")
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
      .setName("标题层级 / Markdown heading level")
      .setDesc("设置工具条“标题”按钮插入几级标题。Choose which heading level the toolbar title button should insert.")
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
      .setName("缺失时自动创建标题 / Create heading if missing")
      .setDesc("如果目标标题不存在，自动补上。Automatically add the target heading when it does not exist yet.")
      .addToggle((toggle) =>
        toggle.setValue(settings.createHeadingIfMissing).onChange(async (value) => {
          settings.createHeadingIfMissing = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("写入模式 / Write mode")
      .setDesc("选择以什么格式写入笔记。Choose how captured text should be written into the note.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("plain", "普通文本 / Plain text")
          .addOption("bullet", "无序列表 / Bullet list")
          .addOption("task", "任务列表 / Task list")
          .setValue(settings.writeMode)
          .onChange(async (value) => {
            settings.writeMode = value as MobileDailyCaptureSettings["writeMode"];
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("固定前缀 / Capture prefix")
      .setDesc("在每条速记前追加固定文本。Text to prepend before the formatted capture block.")
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
      .setName("保存后打开笔记 / Open note after save")
      .setDesc("保存后自动打开今日日记。Reveal today's note after a capture is written.")
      .addToggle((toggle) =>
        toggle.setValue(settings.openAfterSave).onChange(async (value) => {
          settings.openAfterSave = value;
          await this.plugin.saveSettings();
        }),
      );
  }
}
