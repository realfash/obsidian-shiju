import { ButtonComponent, MarkdownView, Modal, Notice } from "obsidian";
import type { TFile } from "obsidian";
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
    replaceFrom?: number;
    replaceTo?: number;
    selectionStart?: number;
    selectionEnd?: number;
  };
};

export class MobileCaptureModal extends Modal {
  plugin: MobileDailyCapturePlugin;
  textAreaEl!: HTMLTextAreaElement;
  tagSuggestionsEl?: HTMLDivElement;
  saveButton?: ButtonComponent;
  saveAndContinueButton?: ButtonComponent;
  private tagSelectionIndex: number = -1;
  private lastInsertedLine: number | undefined;
  private pendingLineBreakSnapshot?: {
    value: string;
    start: number;
    end: number;
  };

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

    this.getToolbarActions().forEach((action) => {
      const button = new ButtonComponent(toolbar);
      button.buttonEl.addClass("mobile-daily-capture-toolbar-button");
      button
        .setButtonText(action.label)
        .setTooltip(action.title)
        .onClick(() => {
          this.insertMarkdown(action);
        });
    });

    const editorWrap = contentEl.createDiv({ cls: "mobile-daily-capture-editor-wrap" });

    this.tagSuggestionsEl = editorWrap.createDiv({ cls: "mobile-daily-capture-tag-suggestions is-hidden" });

    this.textAreaEl = editorWrap.createEl("textarea", {
      attr: {
        placeholder: copy.inputPlaceholder,
      },
    });
    this.captureInputSnapshot();
    this.textAreaEl.addEventListener("beforeinput", this.handleBeforeInput as EventListener);
    this.textAreaEl.addEventListener("keydown", this.handleKeydown);
    this.textAreaEl.addEventListener("input", this.handleInputChange);
    this.textAreaEl.addEventListener("click", this.handleInputChange);
    this.renderTagSuggestions();

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
    this.textAreaEl?.removeEventListener("beforeinput", this.handleBeforeInput as EventListener);
    this.textAreaEl?.removeEventListener("keydown", this.handleKeydown);
    this.textAreaEl?.removeEventListener("input", this.handleInputChange);
    this.textAreaEl?.removeEventListener("click", this.handleInputChange);
    this.contentEl.empty();
  }

  private readonly handleInputChange = (): void => {
    this.repairListContinuationAfterInput();
    this.renderTagSuggestions();
    this.captureInputSnapshot();
  };

  private readonly handleBeforeInput = (event: InputEvent): void => {
    if (event.isComposing) {
      return;
    }

    this.captureInputSnapshot();

    if (
      event.inputType === "insertLineBreak" ||
      event.inputType === "insertParagraph" ||
      event.data === "\n"
    ) {
      this.handleEnterLikeInput(event);
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.isComposing) {
      return;
    }

    if (this.handleTagSuggestionKeydown(event)) {
      return;
    }

    if (event.key === "Tab") {
      this.handleTabKey(event);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      this.captureInputSnapshot();
      this.handleEnterLikeInput(event);
    }
  };

  private handleEnterLikeInput(event: KeyboardEvent | InputEvent): void {
    const textarea = this.textAreaEl;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;

    if (start !== end) {
      return;
    }

    const currentLine = this.getCurrentLine(start);
    const continuation = this.getListContinuation(currentLine);

    if (!continuation) {
      return;
    }

    event.preventDefault();
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);

    if (continuation.mode === "exit") {
      const lineStart = start - currentLine.length;
      textarea.value = `${textarea.value.slice(0, lineStart)}${after}`;
      textarea.setSelectionRange(lineStart, lineStart);
      this.renderTagSuggestions();
      return;
    }

    const insertion = `\n${continuation.prefix}`;
    textarea.value = `${before}${insertion}${after}`;
    const nextPosition = start + insertion.length;
    textarea.setSelectionRange(nextPosition, nextPosition);
    this.renderTagSuggestions();
    this.captureInputSnapshot();
  }

  private handleTabKey(event: KeyboardEvent): void {
    event.preventDefault();

    const textarea = this.textAreaEl;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const value = textarea.value;
    const indent = "    ";
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineEndIndex = value.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const selectedBlock = value.slice(lineStart, lineEnd);
    const lines = selectedBlock.split("\n");

    const nextLines = event.shiftKey
      ? lines.map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line.replace(/^\t/, "")))
      : lines.map((line) => `${indent}${line}`);

    const nextBlock = nextLines.join("\n");
    textarea.value = `${value.slice(0, lineStart)}${nextBlock}${value.slice(lineEnd)}`;

    const selectionStart = event.shiftKey
      ? Math.max(lineStart, start - indent.length)
      : start + indent.length;
    const selectionEnd = event.shiftKey
      ? Math.max(selectionStart, end - indent.length * lines.length)
      : end + indent.length * lines.length;

    textarea.setSelectionRange(selectionStart, selectionEnd);
    this.renderTagSuggestions();
    this.captureInputSnapshot();
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
      const insertionResult = await appendCaptureToDailyNote(this.app, file, value, this.plugin.settings);
      this.lastInsertedLine = insertionResult.success ? insertionResult.insertedLine : undefined;

      if (this.plugin.settings.openAfterSave) {
        await this.openAfterSave(file);
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

  private async openAfterSave(file: TFile): Promise<void> {
    await this.app.workspace.getLeaf(true).openFile(file);

    if (this.lastInsertedLine === undefined) {
      return;
    }

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      return;
    }

    const line = this.lastInsertedLine;
    view.editor.setCursor({ line, ch: 0 });
    view.editor.scrollIntoView(
      {
        from: { line, ch: 0 },
        to: { line: line + 1, ch: 0 },
      },
      true,
    );
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
    const inserted = this.getContextAwareInsert(action, selectedText, start);
    const replaceFrom = inserted.replaceFrom ?? start;
    const replaceTo = inserted.replaceTo ?? end;
    const before = textarea.value.slice(0, replaceFrom);
    const after = textarea.value.slice(replaceTo);

    textarea.value = `${before}${inserted.text}${after}`;

    const nextSelectionStart = replaceFrom + (inserted.selectionStart ?? inserted.text.length);
    const nextSelectionEnd = replaceFrom + (inserted.selectionEnd ?? inserted.text.length);

    textarea.focus();
    textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    this.renderTagSuggestions();
    this.captureInputSnapshot();
  }

  private repairListContinuationAfterInput(): void {
    const snapshot = this.pendingLineBreakSnapshot;
    if (!snapshot) {
      return;
    }

    const textarea = this.textAreaEl;
    const nextValue = textarea.value;
    const cursor = textarea.selectionStart ?? nextValue.length;

    if (snapshot.start !== snapshot.end) {
      this.pendingLineBreakSnapshot = undefined;
      return;
    }

    const insertedLength = nextValue.length - (snapshot.value.length - (snapshot.end - snapshot.start));
    const insertedText = nextValue.slice(snapshot.start, snapshot.start + Math.max(0, insertedLength));

    if (!insertedText.includes("\n")) {
      this.pendingLineBreakSnapshot = undefined;
      return;
    }

    const previousLine = this.getLineFromValue(snapshot.value, snapshot.start);
    const continuation = this.getListContinuation(previousLine);

    if (!continuation || continuation.mode === "exit") {
      this.pendingLineBreakSnapshot = undefined;
      return;
    }

    const currentLine = this.getCurrentLine(cursor);
    if (currentLine.startsWith(continuation.prefix)) {
      this.pendingLineBreakSnapshot = undefined;
      return;
    }

    const currentLineStart = this.getCurrentLineStart(cursor);
    textarea.value = `${nextValue.slice(0, currentLineStart)}${continuation.prefix}${nextValue.slice(currentLineStart)}`;
    const nextCursor = cursor + continuation.prefix.length;
    textarea.setSelectionRange(nextCursor, nextCursor);
    this.pendingLineBreakSnapshot = undefined;
  }

  private getContextAwareInsert(
    action: ToolbarAction,
    selectedText: string,
    cursorPosition: number,
  ): ReturnType<ToolbarAction["insert"]> {
    if (action.label === t(this.plugin.settings).toolbarBulletLabel) {
      return this.insertListMarker(selectedText, cursorPosition, false);
    }

    if (action.label === t(this.plugin.settings).toolbarOrderedLabel) {
      return this.insertListMarker(selectedText, cursorPosition, true);
    }

    return action.insert(selectedText);
  }

  private insertListMarker(
    selectedText: string,
    cursorPosition: number,
    ordered: boolean,
  ): ReturnType<ToolbarAction["insert"]> {
    const currentLine = this.getCurrentLine(cursorPosition);
    const previousLine = this.getPreviousLine(cursorPosition);
    const contextLine = currentLine.trim() ? currentLine : previousLine;
    const lineStart = this.getCurrentLineStart(cursorPosition);
    const orderedContextMatch = contextLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    const bulletContextMatch = contextLine.match(/^(\s*)([-*+])\s+(.*)$/);

    if (!selectedText && currentLine.trim() && !this.isListLine(currentLine)) {
      if (ordered) {
        const orderedPrefix = this.getOrderedStartPrefix(previousLine);
        return {
          text: `${orderedPrefix}${currentLine}`,
          replaceFrom: lineStart,
          replaceTo: lineStart + currentLine.length,
          selectionStart: orderedPrefix.length + (cursorPosition - lineStart),
          selectionEnd: orderedPrefix.length + (cursorPosition - lineStart),
        };
      }

      const bulletPrefix = this.getBulletStartPrefix(previousLine);
      return {
        text: `${bulletPrefix}${currentLine}`,
        replaceFrom: lineStart,
        replaceTo: lineStart + currentLine.length,
        selectionStart: bulletPrefix.length + (cursorPosition - lineStart),
        selectionEnd: bulletPrefix.length + (cursorPosition - lineStart),
      };
    }

    if (ordered) {
      if (orderedContextMatch) {
        const indent = orderedContextMatch[1];
        const currentNumber = Number(orderedContextMatch[2]);
        const text =
          selectedText || (currentLine.trim() ? orderedContextMatch[3] : "") || t(this.plugin.settings).toolbarOrderedPlaceholder;
        const nextNumber = Number.isFinite(currentNumber) ? currentNumber + 1 : 1;
        const prefix = `${indent}${nextNumber}. `;
        return {
          text: prefix + text,
          selectionStart: prefix.length,
          selectionEnd: prefix.length + text.length,
        };
      }

      const text = selectedText || t(this.plugin.settings).toolbarOrderedPlaceholder;
      return {
        text: `1. ${text}`,
        selectionStart: 3,
        selectionEnd: 3 + text.length,
      };
    }

    if (bulletContextMatch) {
      const indent = bulletContextMatch[1];
      const marker = bulletContextMatch[2];
      const text =
        selectedText || (currentLine.trim() ? bulletContextMatch[3] : "") || t(this.plugin.settings).toolbarBulletPlaceholder;
      const prefix = `${indent}${marker} `;
      return {
        text: prefix + text,
        selectionStart: prefix.length,
        selectionEnd: prefix.length + text.length,
      };
    }

    const text = selectedText || t(this.plugin.settings).toolbarBulletPlaceholder;
    return {
      text: `- ${text}`,
      selectionStart: 2,
      selectionEnd: 2 + text.length,
    };
  }

  private getCurrentLine(cursorPosition: number): string {
    const value = this.textAreaEl.value;
    const lineStart = this.getCurrentLineStart(cursorPosition);
    const lineEnd = value.indexOf("\n", cursorPosition);
    return value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd);
  }

  private getCurrentLineStart(cursorPosition: number): number {
    return this.textAreaEl.value.lastIndexOf("\n", Math.max(0, cursorPosition - 1)) + 1;
  }

  private getLineFromValue(value: string, cursorPosition: number): string {
    const lineStart = value.lastIndexOf("\n", Math.max(0, cursorPosition - 1)) + 1;
    const lineEnd = value.indexOf("\n", cursorPosition);
    return value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd);
  }

  private getPreviousLine(cursorPosition: number): string {
    const value = this.textAreaEl.value;
    const currentLineStart = value.lastIndexOf("\n", Math.max(0, cursorPosition - 1)) + 1;
    if (currentLineStart <= 0) {
      return "";
    }

    const previousLineEnd = Math.max(0, currentLineStart - 1);
    const previousLineStart = value.lastIndexOf("\n", Math.max(0, previousLineEnd - 1)) + 1;
    return value.slice(previousLineStart, previousLineEnd);
  }

  private getListContinuation(line: string): { mode: "continue"; prefix: string } | { mode: "exit" } | null {
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      const indent = orderedMatch[1];
      const number = Number(orderedMatch[2]);
      const content = orderedMatch[3].trim();

      if (!content) {
        return { mode: "exit" };
      }

      return { mode: "continue", prefix: `${indent}${number + 1}. ` };
    }

    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1];
      const marker = bulletMatch[2];
      const content = bulletMatch[3].trim();

      if (!content) {
        return { mode: "exit" };
      }

      return { mode: "continue", prefix: `${indent}${marker} ` };
    }

    return null;
  }

  private isListLine(line: string): boolean {
    return /^(\s*)([-*+]|\d+\.)\s+/.test(line);
  }

  private getOrderedStartPrefix(previousLine: string): string {
    const orderedMatch = previousLine.match(/^(\s*)(\d+)\.\s+/);
    if (orderedMatch) {
      return `${orderedMatch[1]}${Number(orderedMatch[2]) + 1}. `;
    }

    return "1. ";
  }

  private getBulletStartPrefix(previousLine: string): string {
    const bulletMatch = previousLine.match(/^(\s*)([-*+])\s+/);
    if (bulletMatch) {
      return `${bulletMatch[1]}${bulletMatch[2]} `;
    }

    return "- ";
  }

  private renderTagSuggestions(): void {
    const container = this.tagSuggestionsEl;
    if (!container) {
      return;
    }

    const query = this.getActiveTagQuery();
    container.empty();

    if (!query) {
      this.tagSelectionIndex = -1;
      container.addClass("is-hidden");
      return;
    }

    const suggestions = this.getTagSuggestions(query);
    if (!suggestions.length) {
      this.tagSelectionIndex = -1;
      container.addClass("is-hidden");
      return;
    }

    this.tagSelectionIndex = 0;
    container.removeClass("is-hidden");

    suggestions.forEach((tag) => {
      const item = container.createDiv({ cls: "mobile-daily-capture-tag-item" });
      const highlightStart = 1;
      const highlightEnd = highlightStart + query.length;

      item.createSpan({ text: tag.slice(0, highlightStart) });
      item.createEl("strong", { text: tag.slice(highlightStart, highlightEnd) });
      item.createSpan({ text: tag.slice(highlightEnd) });
      item.addEventListener("click", () => {
        this.applyTagSuggestion(tag);
      });
    });

    this.updateTagSelection();
  }

  private handleTagSuggestionKeydown(event: KeyboardEvent): boolean {
    const container = this.tagSuggestionsEl;
    if (!container || container.hasClass("is-hidden")) {
      return false;
    }

    const items = Array.from(container.querySelectorAll<HTMLElement>(".mobile-daily-capture-tag-item"));
    if (!items.length) {
      return false;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.tagSelectionIndex = (this.tagSelectionIndex + 1) % items.length;
      this.updateTagSelection();
      return true;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.tagSelectionIndex = (this.tagSelectionIndex - 1 + items.length) % items.length;
      this.updateTagSelection();
      return true;
    }

    if (event.key === "Enter" && this.tagSelectionIndex >= 0) {
      event.preventDefault();
      const selected = items[this.tagSelectionIndex];
      const tag = selected?.textContent;
      if (tag) {
        this.applyTagSuggestion(tag);
      }
      return true;
    }

    return false;
  }

  private updateTagSelection(): void {
    const container = this.tagSuggestionsEl;
    if (!container) {
      return;
    }

    const items = Array.from(container.querySelectorAll<HTMLElement>(".mobile-daily-capture-tag-item"));
    items.forEach((item, index) => {
      item.toggleClass("is-selected", index === this.tagSelectionIndex);
    });
  }

  private captureInputSnapshot(): void {
    const textarea = this.textAreaEl;
    if (!textarea) {
      return;
    }

    this.pendingLineBreakSnapshot = {
      value: textarea.value,
      start: textarea.selectionStart ?? textarea.value.length,
      end: textarea.selectionEnd ?? textarea.value.length,
    };
  }

  private getActiveTagQuery(): string | null {
    const textarea = this.textAreaEl;
    const cursorPosition = textarea.selectionStart ?? textarea.value.length;
    const beforeCursor = textarea.value.slice(0, cursorPosition);
    const match = beforeCursor.match(/(^|\s)#([^\s#]*)$/);
    if (!match) {
      return null;
    }

    return match[2];
  }

  private getTagSuggestions(query: string): string[] {
    const metadataCache = this.app.metadataCache as unknown as {
      getTags?: () => Record<string, number>;
    };

    const availableTags = Object.keys(metadataCache.getTags?.() ?? {});
    return availableTags
      .filter((tag) => tag.toLowerCase().startsWith(`#${query.toLowerCase()}`))
      .sort((left, right) => left.localeCompare(right))
      .slice(0, 8);
  }

  private applyTagSuggestion(tag: string): void {
    const textarea = this.textAreaEl;
    const cursorPosition = textarea.selectionStart ?? textarea.value.length;
    const beforeCursor = textarea.value.slice(0, cursorPosition);
    const afterCursor = textarea.value.slice(cursorPosition);
    const match = beforeCursor.match(/(^|\s)#([^\s#]*)$/);

    if (!match) {
      return;
    }

    const replacementStart = beforeCursor.length - match[0].length + match[1].length;
    const nextValue = `${beforeCursor.slice(0, replacementStart)}${tag}${afterCursor}`;
    const nextCursor = replacementStart + tag.length;

    textarea.value = nextValue;
    textarea.focus();
    textarea.setSelectionRange(nextCursor, nextCursor);
    this.renderTagSuggestions();
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
      {
        label: copy.toolbarItalicLabel,
        title: copy.toolbarItalicTitle,
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarItalicPlaceholder;
          return {
            text: `*${text}*`,
            selectionStart: 1,
            selectionEnd: 1 + text.length,
          };
        },
      },
      {
        label: copy.toolbarCodeLabel,
        title: copy.toolbarCodeTitle,
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarCodePlaceholder;
          return {
            text: `\`${text}\``,
            selectionStart: 1,
            selectionEnd: 1 + text.length,
          };
        },
      },
      {
        label: copy.toolbarQuoteLabel,
        title: copy.toolbarQuoteTitle,
        insert: (selectedText) => {
          const text = selectedText || copy.toolbarQuotePlaceholder;
          const lines = text.split("\n");
          const quoted = lines.map((line) => `> ${line}`).join("\n");
          return { text: `${quoted}\n\n` };
        },
      },
      {
        label: copy.toolbarHrLabel,
        title: copy.toolbarHrTitle,
        insert: (_selectedText) => {
          return { text: "\n---\n" };
        },
      },
    ];
  }
}
