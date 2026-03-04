export type MsgPing = {
  type: "ping";
};

export type MsgCopySelection = {
  type: "copy-selection";
  payload: {
    text: string;
    html: string;
  };
};

export type MsgHtmlPurify = {
  type: "html-purify";
  payload: {
    html: string;
  };
};

export type MsgHtmlToMarkdown = {
  type: "html-to-markdown";
  payload: {
    html: string;
  };
};

export type Message =
  | MsgPing
  | MsgCopySelection
  | MsgHtmlPurify
  | MsgHtmlToMarkdown;
