export type CaptureWriteMode = "plain" | "bullet" | "task";

export interface MobileDailyCaptureSettings {
  dailyNotePathFormat: string;
  dailyNoteTemplatePath: string;
  targetHeading: string;
  markdownHeadingLevel: "1" | "2" | "3" | "4" | "5" | "6";
  createHeadingIfMissing: boolean;
  capturePrefix: string;
  writeMode: CaptureWriteMode;
  openAfterSave: boolean;
}
