import { ButtonComponent, Modal, Notice } from "obsidian";
import { appendCaptureToDailyNote, notifyWriteError } from "./insertion";
import { ensureDailyNote } from "./daily-note";
import type MobileDailyCapturePlugin from "../main";
import type { MobileDailyCaptureSettings } from "./types";

type ToolbarAction = {
  label: string;
  title: string;
  settingsKey?: keyof MobileDailyCaptureSettings;
  insert: (selectedText: string) => {
    text: string;
    selectionStart?: number;
    selectionEnd?: number;
  };
};

export class MobileCaptureModal extends Modal {
  plugin: MobileDailyCapturePlugin;
  textAreaEl!: HTMLTextAreaElement;
  saveButton?: ButtonComponent;
  saveAndContinueButton?: ButtonComponent;

  constructor(app: MobileDailyCapturePlugin["app"], plugin: MobileDailyCapturePlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    const { contentEl, modalEl } = this;
    modalEl.addClass("mobile-daily-capture-modal");

    this.setTitle("速记");

    contentEl.empty();
    contentEl.createDiv({
      cls: "mobile-daily-capture-hint",
      text: "先记下来，稍后再整理。内容会自动追加到今天的每日笔记。",
    });

    const toolbar = contentEl.createDiv({ cls: "mobile-daily-capture-toolbar" });
    toolbar.style.display = "grid";
    toolbar.style.gridTemplateColumns = "repeat(5, minmax(0, 1fr))";
    toolbar.style.gap = "0.3rem";
    toolbar.style.width = "100%";

    this.getToolbarActions().forEach((action) => {
      const button = new ButtonComponent(toolbar);
      button
        .setButtonText(action.label)
        .setTooltip(action.title)
        .onClick(() => {
          this.insertMarkdown(action);
        });

      button.buttonEl.style.width = "100%";
      button.buttonEl.style.minWidth = "0";
      button.buttonEl.style.minHeight = "32px";
      button.buttonEl.style.padding = "0.16rem 0.08rem";
      button.buttonEl.style.borderRadius = "8px";
      button.buttonEl.style.fontSize = "0.78rem";
      button.buttonEl.style.lineHeight = "1.1";
      button.buttonEl.style.whiteSpace = "nowrap";
      button.buttonEl.style.textAlign = "center";
    });

    this.textAreaEl = contentEl.createEl("textarea", {
      attr: {
        placeholder: "记录今天的想法、事项或灵感...",
      },
    });

    const footer = contentEl.createDiv({ cls: "mobile-daily-capture-footer" });

    new ButtonComponent(footer)
      .setButtonText("取消")
      .onClick(() => {
        this.close();
      });

    this.saveAndContinueButton = new ButtonComponent(footer)
      .setButtonText("保存并继续")
      .setCta()
      .onClick(() => {
        void this.handleSave(true);
      });

    this.saveButton = new ButtonComponent(footer)
      .setButtonText("保存")
      .setCta()
      .onClick(() => {
        void this.handleSave(false);
      });

    window.setTimeout(() => this.textAreaEl?.focus(), 50);
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private async handleSave(keepOpen: boolean): Promise<void> {
    const value = this.textAreaEl.value.trim();
    if (!value) {
      new Notice("先输入一点内容再保存。");
      this.textAreaEl.focus();
      return;
    }

    this.setSavingState(true);

    try {
      const file = await ensureDailyNote(this.app, this.plugin.settings);
      await appendCaptureToDailyNote(this.app, file, value, this.plugin.settings);

      if (this.plugin.settings.openAfterSave) {
        await this.app.workspace.getLeaf(true).openFile(file);
      }

      new Notice("已追加到今天的每日笔记。");

      if (keepOpen) {
        this.textAreaEl.value = "";
        this.textAreaEl.focus();
      } else {
        this.close();
      }
    } catch (error) {
      console.error("Failed to save capture", error);
      notifyWriteError(error);
    } finally {
      this.setSavingState(false);
    }
  }

  private setSavingState(isSaving: boolean): void {
    this.saveButton?.setDisabled(isSaving);
    this.saveAndContinueButton?.setDisabled(isSaving);
    if (this.textAreaEl) {
      this.textAreaEl.disabled = isSaving;
    }
  }

  private insertMarkdown(action: ToolbarAction): void {
    const textarea = this.textAreaEl;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const selectedText = textarea.value.slice(start, end);
    const inserted = action.insert(selectedText);
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);

    textarea.value = `${before}${inserted.text}${after}`;

    const nextSelectionStart = start + (inserted.selectionStart ?? inserted.text.length);
    const nextSelectionEnd = start + (inserted.selectionEnd ?? inserted.text.length);

    textarea.focus();
    textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
  }

  private getToolbarActions(): ToolbarAction[] {
    const headingLevel = Number(this.plugin.settings.markdownHeadingLevel || "2");
    const headingPrefix = `${"#".repeat(headingLevel)} `;

    return [
      {
        label: "标题",
        title: `插入 H${headingLevel} 标题`,
        insert: (selectedText) => {
          const text = selectedText || "标题";
          return {
            text: `${headingPrefix}${text}`,
            selectionStart: headingPrefix.length,
            selectionEnd: headingPrefix.length + text.length,
          };
        },
      },
      {
        label: "加粗",
        title: "插入加粗",
        insert: (selectedText) => {
          const text = selectedText || "重点";
          return {
            text: `**${text}**`,
            selectionStart: 2,
            selectionEnd: 2 + text.length,
          };
        },
      },
      {
        label: "列表",
        title: "插入无序列表",
        insert: (selectedText) => {
          const text = selectedText || "列表项";
          return {
            text: `- ${text}`,
            selectionStart: 2,
            selectionEnd: 2 + text.length,
          };
        },
      },
      {
        label: "有序",
        title: "插入有序列表",
        insert: (selectedText) => {
          const text = selectedText || "列表项";
          return {
            text: `1. ${text}`,
            selectionStart: 3,
            selectionEnd: 3 + text.length,
          };
        },
      },
      {
        label: "标签",
        title: "插入标签",
        insert: (selectedText) => {
          const text = selectedText || "标签";
          return {
            text: `#${text}`,
            selectionStart: 1,
            selectionEnd: 1 + text.length,
          };
        },
      },
    ];
  }
}
