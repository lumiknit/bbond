import { Config, configSchema, defaultConfig } from "./options";

export const readChromeStorage = <T extends any>(
  key: string,
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] as T | undefined);
    });
  });
};

export const multiReadChromeStorage = (
  keys: string[],
): Promise<{ [key: string]: any }> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result);
    });
  });
};

// Config storage

const KEY_CONFIG = "config";

export const loadConfig = (): Promise<Config> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([KEY_CONFIG], (result) => {
      const raw = result.config;
      try {
        const parsed = configSchema.parse(raw);
        resolve(parsed);
      } catch (e) {
        console.error("Failed to parse config, using default. Error:", e);
        chrome.storage.local.set({ [KEY_CONFIG]: defaultConfig });
        resolve(defaultConfig);
      }
    });
  });
};

export const storeConfig = (config: Config): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [KEY_CONFIG]: config }, () => {
      resolve();
    });
  });
};

// Is Recording Storage (Use session storage)
const KEY_IS_RECORDING = "isRecording";
const defaultIsRecording = false;
export const loadIsRecording = (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([KEY_IS_RECORDING], (result) => {
      const raw = result.isRecording;
      if (typeof raw === "boolean") {
        resolve(raw);
      } else {
        chrome.storage.local.set({ [KEY_IS_RECORDING]: defaultIsRecording });
        resolve(defaultIsRecording);
      }
    });
  });
};

export const storeIsRecording = (isRecording: boolean): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [KEY_IS_RECORDING]: isRecording }, () => {
      resolve();
    });
  });
};

// Clipboard History Storage
const KEY_CLIPBOARD = "_clipboard";
export const loadClipboardHistory = (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([KEY_CLIPBOARD], (result) => {
      const raw = result[KEY_CLIPBOARD];
      if (typeof raw === "string") {
        resolve(raw);
      } else {
        chrome.storage.local.set({ [KEY_CLIPBOARD]: "" });
        resolve("");
      }
    });
  });
};

export const storeClipboardHistory = (history: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [KEY_CLIPBOARD]: history }, () => {
      resolve();
    });
  });
};

// Change Listener
export type StorageChangeHandler = {
  clipboardHistory?: (newValue: string) => void;
  isRecording?: (newValue: boolean) => void;
  config?: (newValue: Config) => void;
};

export const addStorageChangeListener = (
  handler: StorageChangeHandler,
): (() => void) => {
  const listener = (changes: {
    [key: string]: chrome.storage.StorageChange;
  }) => {
    console.log("Storage changed", changes);
    if (changes[KEY_CLIPBOARD] && handler.clipboardHistory) {
      handler.clipboardHistory(changes[KEY_CLIPBOARD].newValue as string);
    }
    if (changes[KEY_IS_RECORDING] && handler.isRecording) {
      handler.isRecording(changes[KEY_IS_RECORDING].newValue as boolean);
    }
    if (changes[KEY_CONFIG] && handler.config) {
      try {
        const parsedConfig = configSchema.parse(changes[KEY_CONFIG].newValue);
        handler.config(parsedConfig);
      } catch (e) {
        console.error("Failed to parse updated config from storage change", e);
      }
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};
