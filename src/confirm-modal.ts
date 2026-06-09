import { App, ButtonComponent, Modal } from "obsidian";

export class ConfirmModal extends Modal {
  private resolveFn: ((value: boolean) => void) | null = null;
  private message: string;

  constructor(app: App, message: string) {
    super(app);
    this.message = message;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("p", { text: this.message });

    const buttonRow = contentEl.createDiv({ cls: "modal-button-container" });
    new ButtonComponent(buttonRow)
      .setButtonText("Cancel")
      .onClick(() => {
        this.resolveFn?.(false);
        this.close();
      });

    new ButtonComponent(buttonRow)
      .setButtonText("Confirm")
      .setCta()
      .onClick(() => {
        this.resolveFn?.(true);
        this.close();
      });
  }

  onClose(): void {
    this.resolveFn?.(false);
    this.resolveFn = null;
  }

  waitForConfirmation(): Promise<boolean> {
    this.open();
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }
}
