import type { CaptureWriteMode, LanguagePreference, MobileDailyCaptureSettings } from "./types";

type Locale = "zh" | "en";

type Copy = {
  pluginTitle: string;
  openCapture: string;
  openCaptureError: string;
  settingsIntro: string;
  languageName: string;
  languageDesc: string;
  languageOptions: Record<LanguagePreference, string>;
  dailyNotePathFormatName: string;
  dailyNotePathFormatDesc: string;
  templatePathName: string;
  templatePathDesc: string;
  targetHeadingName: string;
  targetHeadingDesc: string;
  markdownHeadingLevelName: string;
  markdownHeadingLevelDesc: string;
  createHeadingIfMissingName: string;
  createHeadingIfMissingDesc: string;
  writeModeName: string;
  writeModeDesc: string;
  writeModeOptions: Record<CaptureWriteMode, string>;
  capturePrefixName: string;
  capturePrefixDesc: string;
  openNoteAfterSaveName: string;
  openNoteAfterSaveDesc: string;
  resetButtonText: string;
  resetConfirmMessage: string;
  modalTitle: string;
  modalHint: string;
  inputPlaceholder: string;
  cancel: string;
  save: string;
  saveAndContinue: string;
  saveEmptyNotice: string;
  saveSuccessNotice: string;
  tagSuggestionsEmpty: string;
  toolbarHeadingLabel: string;
  toolbarHeadingTitle: (level: number) => string;
  toolbarHeadingPlaceholder: string;
  toolbarBoldLabel: string;
  toolbarBoldTitle: string;
  toolbarBoldPlaceholder: string;
  toolbarBulletLabel: string;
  toolbarBulletTitle: string;
  toolbarBulletPlaceholder: string;
  toolbarOrderedLabel: string;
  toolbarOrderedTitle: string;
  toolbarOrderedPlaceholder: string;
  toolbarTagLabel: string;
  toolbarTagTitle: string;
  toolbarTagPlaceholder: string;
  toolbarItalicLabel: string;
  toolbarItalicTitle: string;
  toolbarItalicPlaceholder: string;
  toolbarCodeLabel: string;
  toolbarCodeTitle: string;
  toolbarCodePlaceholder: string;
  toolbarQuoteLabel: string;
  toolbarQuoteTitle: string;
  toolbarQuotePlaceholder: string;
  toolbarHrLabel: string;
  toolbarHrTitle: string;
};

const COPY: Record<Locale, Copy> = {
  zh: {
    pluginTitle: "Shiju",
    openCapture: "拾句",
    openCaptureError: "无法打开速记面板。",
    settingsIntro: "配置速记内容要写入到哪里。",
    languageName: "语言",
    languageDesc: "选择插件界面的显示语言。",
    languageOptions: {
      auto: "跟随系统",
      zh: "中文",
      en: "English",
    },
    dailyNotePathFormatName: "每日笔记路径格式",
    dailyNotePathFormatDesc: "今日日记的 vault 相对路径模板，支持 YYYY、YY、MM、DD。",
    templatePathName: "模板路径",
    templatePathDesc: "今日日记不存在时使用的模板路径。",
    targetHeadingName: "目标标题",
    targetHeadingDesc: "速记内容会插入到这个标题下，不需要写前导 #。",
    markdownHeadingLevelName: "标题层级",
    markdownHeadingLevelDesc: "设置工具条“标题”按钮插入几级标题。",
    createHeadingIfMissingName: "缺失时自动创建标题",
    createHeadingIfMissingDesc: "如果目标标题不存在，自动补上。",
    writeModeName: "写入模式",
    writeModeDesc: "选择以什么格式写入笔记。",
    writeModeOptions: {
      plain: "普通文本",
      bullet: "无序列表",
      task: "任务列表",
    },
    capturePrefixName: "固定前缀",
    capturePrefixDesc: "在每条速记前追加固定文本。",
    openNoteAfterSaveName: "保存后打开笔记",
    openNoteAfterSaveDesc: "保存后自动打开今日日记。",
    resetButtonText: "恢复默认设置",
    resetConfirmMessage: "确定要恢复所有设置到默认值吗？此操作不可撤销。",
    modalTitle: "拾句",
    modalHint: "先记下来，稍后再整理。内容会自动追加到今天的每日笔记。",
    inputPlaceholder: "记录今天的想法、事项或灵感...",
    cancel: "取消",
    save: "保存",
    saveAndContinue: "保存并继续",
    saveEmptyNotice: "先输入一点内容再保存。",
    saveSuccessNotice: "已追加到今天的每日笔记。",
    tagSuggestionsEmpty: "没有匹配的标签",
    toolbarHeadingLabel: "标题",
    toolbarHeadingTitle: (level: number) => `插入 H${level} 标题`,
    toolbarHeadingPlaceholder: "标题",
    toolbarBoldLabel: "加粗",
    toolbarBoldTitle: "插入加粗",
    toolbarBoldPlaceholder: "重点",
    toolbarBulletLabel: "列表",
    toolbarBulletTitle: "插入无序列表",
    toolbarBulletPlaceholder: "列表项",
    toolbarOrderedLabel: "有序",
    toolbarOrderedTitle: "插入有序列表",
    toolbarOrderedPlaceholder: "列表项",
    toolbarTagLabel: "标签",
    toolbarTagTitle: "插入标签",
    toolbarTagPlaceholder: "标签",
    toolbarItalicLabel: "I",
    toolbarItalicTitle: "斜体",
    toolbarItalicPlaceholder: "斜体文本",
    toolbarCodeLabel: "</>",
    toolbarCodeTitle: "行内代码",
    toolbarCodePlaceholder: "代码",
    toolbarQuoteLabel: "\"",
    toolbarQuoteTitle: "引用",
    toolbarQuotePlaceholder: "引用内容",
    toolbarHrLabel: "—",
    toolbarHrTitle: "分割线",
  },
  en: {
    pluginTitle: "Shiju",
    openCapture: "Open quick capture",
    openCaptureError: "Unable to open quick capture.",
    settingsIntro: "Choose where quick captures should be stored in today's daily note.",
    languageName: "Language",
    languageDesc: "Choose which language the plugin interface should use.",
    languageOptions: {
      auto: "Follow system",
      zh: "中文",
      en: "English",
    },
    dailyNotePathFormatName: "Daily note path format",
    dailyNotePathFormatDesc: "Vault-relative path template for today's note. Supports YYYY, YY, MM, DD.",
    templatePathName: "Template path",
    templatePathDesc: "Vault-relative template note used when today's daily note does not exist.",
    targetHeadingName: "Target heading",
    targetHeadingDesc: "The heading under which captured text will be inserted.",
    markdownHeadingLevelName: "Markdown heading level",
    markdownHeadingLevelDesc: "Choose which heading level the toolbar title button should insert.",
    createHeadingIfMissingName: "Create heading if missing",
    createHeadingIfMissingDesc: "Automatically add the target heading when it does not exist yet.",
    writeModeName: "Write mode",
    writeModeDesc: "Choose how captured text should be written into the note.",
    writeModeOptions: {
      plain: "Plain text",
      bullet: "Bullet list",
      task: "Task list",
    },
    capturePrefixName: "Capture prefix",
    capturePrefixDesc: "Text to prepend before the formatted capture block.",
    openNoteAfterSaveName: "Open note after save",
    openNoteAfterSaveDesc: "Reveal today's note after a capture is written.",
    resetButtonText: "Reset to Defaults",
    resetConfirmMessage: "Are you sure you want to reset all settings to their defaults? This action cannot be undone.",
    modalTitle: "Quick capture",
    modalHint: "Capture it first and organize it later. The text will be appended to today's daily note.",
    inputPlaceholder: "Capture a thought, task, or spark...",
    cancel: "Cancel",
    save: "Save",
    saveAndContinue: "Save and continue",
    saveEmptyNotice: "Enter something before saving.",
    saveSuccessNotice: "Added to today's daily note.",
    tagSuggestionsEmpty: "No matching tags",
    toolbarHeadingLabel: "Heading",
    toolbarHeadingTitle: (level: number) => `Insert H${level} heading`,
    toolbarHeadingPlaceholder: "Heading",
    toolbarBoldLabel: "Bold",
    toolbarBoldTitle: "Insert bold text",
    toolbarBoldPlaceholder: "Emphasis",
    toolbarBulletLabel: "Bullet",
    toolbarBulletTitle: "Insert bullet list",
    toolbarBulletPlaceholder: "List item",
    toolbarOrderedLabel: "Ordered",
    toolbarOrderedTitle: "Insert ordered list",
    toolbarOrderedPlaceholder: "List item",
    toolbarTagLabel: "Tag",
    toolbarTagTitle: "Insert tag",
    toolbarTagPlaceholder: "tag",
    toolbarItalicLabel: "I",
    toolbarItalicTitle: "Italic",
    toolbarItalicPlaceholder: "italic text",
    toolbarCodeLabel: "</>",
    toolbarCodeTitle: "Inline Code",
    toolbarCodePlaceholder: "code",
    toolbarQuoteLabel: "\"",
    toolbarQuoteTitle: "Blockquote",
    toolbarQuotePlaceholder: "quote",
    toolbarHrLabel: "—",
    toolbarHrTitle: "Horizontal Rule",
  },
};

export function getLocale(settings: MobileDailyCaptureSettings): Locale {
  if (settings.language === "zh" || settings.language === "en") {
    return settings.language;
  }

  if (typeof window !== "undefined") {
    const systemLanguage = window.navigator.language.toLowerCase();
    return systemLanguage.startsWith("zh") ? "zh" : "en";
  }

  return "en";
}

export function t(settings: MobileDailyCaptureSettings): Copy {
  return COPY[getLocale(settings)];
}
