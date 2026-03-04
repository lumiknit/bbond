import { Config, SepStrategy } from "../core/options";
import { MsgCopySelection } from "@/core/message";
import {
  loadClipboardHistory,
  loadConfig,
  storeClipboardHistory,
  storeIsRecording,
} from "@/core/chrome-storage";

let creatingOffscreen: Promise<void> | null = null;
async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: ["src/offscreen/offscreen.html"],
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: "src/offscreen/offscreen.html",
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "HTML to Markdown parsing using DOM APIs",
    });
    await creatingOffscreen;
  }
}

const applySepConfig = (history: string, cfg: SepStrategy): string => {
  if (cfg.condition === "always") {
    history += cfg.separator.value;
  } else if (cfg.condition === "trim") {
    if (history.length === 0) return history;
    history = history.trimEnd() + cfg.separator.value;
  } else if (cfg.condition === "smart" && history) {
    if (history.length === 0) return history;
    if (!/[\n\r\t.,;:]\s*$/.test(history)) {
      history += cfg.separator.value;
    }
  }
  return history;
};

const purifyHtml = async (html: string): Promise<string> => {
  const response = await chrome.runtime.sendMessage({
    type: "purify-html",
    payload: { html },
  });
  return response && response.cleanHtml ? response.cleanHtml : html;
};

const htmlToMarkdown = async (html: string): Promise<string> => {
  const response = await chrome.runtime.sendMessage({
    type: "html-to-markdown",
    payload: { html },
  });
  return response && response.markdown ? response.markdown : html;
};

const mergeHistory = async (
  config: Config,
  history: string,
  text: string,
  html: string,
): Promise<void | string> => {
  let contentToAppend = "";
  if (config.contentsHandleOption === "markdown" && html) {
    try {
      await setupOffscreenDocument();
      const markdown = await htmlToMarkdown(html);
      if (markdown) {
        contentToAppend = markdown;
      }
    } catch (e) {
      console.error("Offscreen parsing failed", e);
      return;
    }
    if (!contentToAppend) contentToAppend = text; // Fallback
  } else if (config.contentsHandleOption === "html") {
    try {
      await setupOffscreenDocument();
      const cleanHtml = await purifyHtml(html);
      if (cleanHtml) {
        contentToAppend = cleanHtml;
      }
    } catch (e) {
      console.error("Offscreen purify failed", e);
      return;
    }
  } else {
    contentToAppend = text;
  }

  if (!contentToAppend) return;

  let finalHistory = history;

  finalHistory = applySepConfig(finalHistory, config.beforeSep);
  finalHistory += contentToAppend;
  finalHistory = applySepConfig(finalHistory, config.afterSep);

  return finalHistory;
};

// Message handlers

const messageHandlers = new Map<string, (message: any) => void>();

messageHandlers.set("copy-selection", async (message: MsgCopySelection) => {
  const { text, html } = message.payload;

  const history = await loadClipboardHistory();
  const config = await loadConfig();

  const updatedHistory = await mergeHistory(config, history, text, html);
  if (updatedHistory) {
    console.log("Updated History:", updatedHistory);
    await storeClipboardHistory(updatedHistory);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (typeof message !== "object" || !message.type) return;
  const handler = messageHandlers.get(message.type);
  if (handler) {
    handler(message);
  } else {
    console.error("No handler for message type:", message.type);
  }
});

// Turn off recording at start-up
storeIsRecording(false);
