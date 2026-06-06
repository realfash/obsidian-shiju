import { ButtonComponent, Modal, Notice } from "obsidian";
import { appendCaptureToDailyNote, notifyWriteError } from "./insertion";
import { ensureDailyNote } from "./daily-note";
import type MobileDailyCapturePlugin from "../main";
import type { MobileDailyCaptureSettings } from "./types";
import { t } from "./i18n";

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
    const copy = t(this.plugin.settings);
    modalEl.addClass("mobile-daily-capture-modal");

    this.setTitle(copy.modalTitle);

    contentEl.empty();
    contentEl.createDiv({
      cls: "mobile-daily-capture-hint",
      text: copy.modalHint,
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
        placeholder: copy.inputPlaceholder,
      },
    });

    const footer = contentEl.createDiv({ cls: "mobile-daily-capture-footer" });

    new ButtonComponent(footer)
      .setButtonText(copy.cancel)
      .onClick(() => {
        this.close();
      });

    this.saveAndContinueButton = new ButtonComponent(footer)
      .setButtonText(copy.saveAndContinue)
      .setCta()
      .onClick(() => {
        void this.handleSave(true);
      });

    this.saveButton = new ButtonComponent(footer)
      .setButtonText(copy.save)
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
    const copy = t(this.plugin.settings);
    const value = this.textAreaEl.value.trim();
    if (!value) {
      new Notice(copy.saveEmptyNotice);
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

      new Notice(copy.saveSuccessNotice);

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
    const copy = t(this.plugin.settings);
    const headingLevel = Number(this.plugin.settings.markdownHeadingLevel || "2");
    const headingPrefix = `${"#".repeat(headingLevel)} `;

    return [
      {
        label: copy.toolbarHeadingLabel,
        title: copy.toolbarHeadingTitle(headingLevel),
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarHeadingPlaceholder;
          return {
            text: `${headingPrefix}${text}`,
            selectionStart: headingPrefix.length,
            selectionEnd: headingPrefix.length + text.length,
          };
        },
      },
      {
        label: copy.toolbarBoldLabel,
        title: copy.toolbarBoldTitle,
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarBoldPlaceholder;
          return {
            text: `**${text}**`,
            selectionStart: 2,
            selectionEnd: 2 + text.length,
          };
        },
      },
      {
        label: copy.toolbarBulletLabel,
        title: copy.toolbarBulletTitle,
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarBulletPlaceholder;
          return {
            text: `- ${text}`,
            selectionStart: 2,
            selectionEnd: 2 + text.length,
          };
        },
      },
      {
        label: copy.toolbarOrderedLabel,
        title: copy.toolbarOrderedTitle,
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarOrderedPlaceholder;
          return {
            text: `1. ${text}`,
            selectionStart: 3,
            selectionEnd: 3 + text.length,
          };
        },
      },
      {
        label: copy.toolbarTagLabel,
        title: copy.toolbarTagTitle,
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarTagPlaceholder;
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
