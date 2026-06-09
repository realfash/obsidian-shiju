import { Notice, Plugin } from "obsidian";
import { MobileCaptureModal } from "./src/capture-modal";
import { t } from "./src/i18n";
import { DEFAULT_SETTINGS, MobileDailyCaptureSettingTab } from "./src/settings";
import type { MobileDailyCaptureSettings } from "./src/types";

export default class MobileDailyCapturePlugin extends Plugin {
  settings: MobileDailyCaptureSettings = DEFAULT_SETTINGS;
  ribbonIconEl?: HTMLElement;

  async onload(): Promise<void> {
    await this.loadSettings();
    const copy = this.getCopy();

    this.ribbonIconEl = this.addRibbonIcon("square-pen", copy.openCapture, () => {
      void this.openCaptureModal();
    });

    this.addCommand({
      id: "open-mobile-capture",
      name: copy.openCapture,
      callback: () => {
        void this.openCaptureModal();
      },
    });

    this.addSettingTab(new MobileDailyCaptureSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();
    const savedSettings = isMobileDailyCaptureSettingsData(loaded) ? loaded : {};
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...savedSettings,
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  getCopy(): ReturnType<typeof t> {
    return t(this.settings);
  }

  updateRibbonTooltip(): void {
    if (this.ribbonIconEl) {
      this.ribbonIconEl.ariaLabel = this.getCopy().openCapture;
    }
  }

  async openCaptureModal(): Promise<void> {
    try {
      const modal = new MobileCaptureModal(this.app, this);
      modal.open();
    } catch (error) {
      console.error("Failed to open mobile capture modal", error);
      new Notice(t(this.settings).openCaptureError);
    }
  }
}

function isMobileDailyCaptureSettingsData(value: unknown): value is Partial<MobileDailyCaptureSettings> {
  return typeof value === "object" && value !== null;
}
