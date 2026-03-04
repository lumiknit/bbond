import DOMPurify from "dompurify";
import TurndownService from "turndown";
import { Message } from "../core/message";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

chrome.runtime.onMessage.addListener(
  (message: Message | any, _sender, sendResponse) => {
    console.log("Message recieved", message.type);
    switch (message.type) {
      case "html-purify": {
        const { html } = message.payload;
        try {
          const cleanHtml = DOMPurify.sanitize(html);
          sendResponse({ cleanHtml });
        } catch (e) {
          console.error("DOMPurify failed", e);
          sendResponse({ cleanHtml: "" });
        }
        return true; // Indicate we are sending response asynchronously (or keep as needed)
      }
      case "html-to-markdown": {
        const { html } = message.payload;
        try {
          const cleanHtml = DOMPurify.sanitize(html);
          const markdown = turndownService.turndown(cleanHtml);
          sendResponse({ markdown });
        } catch (e) {
          console.error("Turndown / DOMPurify failed", e);
          sendResponse({ markdown: "" });
        }
        return true; // Indicate we are sending response asynchronously (or keep as needed)
      }
    }
  },
);
