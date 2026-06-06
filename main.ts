import { Notice, Plugin } from "obsidian";
import { MobileCaptureModal } from "./src/capture-modal";
import { DEFAULT_SETTINGS, MobileDailyCaptureSettingTab } from "./src/settings";
import type { MobileDailyCaptureSettings } from "./src/types";

export default class MobileDailyCapturePlugin extends Plugin {
  settings: MobileDailyCaptureSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addRibbonIcon("square-pen", "打开速记", () => {
      void this.openCaptureModal();
    });

    this.addCommand({
      id: "open-mobile-capture",
      name: "打开速记",
      callback: () => {
        void this.openCaptureModal();
      },
    });

    this.addSettingTab(new MobileDailyCaptureSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async openCaptureModal(): Promise<void> {
    try {
      const modal = new MobileCaptureModal(this.app, this);
      modal.open();
    } catch (error) {
      console.error("Failed to open mobile capture modal", error);
      new Notice("无法打开速记面板。");
    }
  }
}
