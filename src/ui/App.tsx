import { Component, createSignal, onCleanup, onMount } from "solid-js";
import CodeEdit from "../components/code/CodeEdit";
import {
  Config,
  defaultConfig,
  sepConditions,
  separators,
  contentsHandleOptions,
  SepCondition,
  SepStrategy,
} from "../core/options";
import { TbOutlineCopy, TbOutlineHtml } from "solid-icons/tb";
import ConfigView from "./ConfigView";
import { marked } from "marked";
import toast, { Toaster } from "solid-toast";

import "./App.scss";
import {
  addStorageChangeListener,
  loadClipboardHistory,
  loadConfig,
  loadIsRecording,
  storeClipboardHistory,
  storeIsRecording,
} from "@/core/chrome-storage";

type SepSelectProps = {
  label: string;
  value: SepStrategy;
  onChange: (newStrategy: SepStrategy) => void;
};

const SepSelect: Component<SepSelectProps> = (props) => {
  return (
    <div class="option-group">
      <span>{props.label}:</span>
      <select
        value={props.value.condition}
        onChange={(e) =>
          props.onChange({
            ...props.value,
            condition: e.currentTarget.value as SepCondition,
          })
        }
      >
        {sepConditions.map((c) => (
          <option value={c}>{c}</option>
        ))}
      </select>
      <select
        value={props.value.separator.label}
        onChange={(e) =>
          props.onChange({
            ...props.value,
            separator: separators.find(
              (s) => s.label === e.currentTarget.value,
            )!,
          })
        }
      >
        {separators.map((s) => (
          <option value={s.label}>{s.label}</option>
        ))}
      </select>
    </div>
  );
};

const App: Component = () => {
  const codeGetBox: [(() => string)?] = [];
  const codeSetText: [((text: string) => void)?] = [];
  const [loaded, setLoaded] = createSignal(false);
  const [initialText, setInitialText] = createSignal("");
  const [isRecording, setIsRecording] = createSignal(true);
  const [config, setConfig] = createSignal<Config>(defaultConfig);
  const [showConfig, setShowConfig] = createSignal(false);

  let cleanUpFn = () => {};

  const updateConfig = (newConfig: Partial<Config>) => {
    const updated = { ...config(), ...newConfig };
    setConfig(updated);
    chrome.storage.local.set({ config: updated });
  };

  onMount(async () => {
    const history = await loadClipboardHistory();
    const isRecordingVal = await loadIsRecording();
    const cfg = await loadConfig();

    // Initial load
    setIsRecording(isRecordingVal);
    if (cfg) setConfig(cfg);

    setInitialText(history);
    setLoaded(true);

    // Give CodeEdit a brief moment to mount before forcing a scroll to bottom
    codeSetText[0]?.(history);

    // Auto copy on window focus
    const handleFocus = async () => {
      if (config().autoStartRecordingOnFocus && !isRecording()) {
        storeIsRecording(true);
      }

      const mode = config().autoCopyOnFocus;
      if (mode === "none") return;

      const textToCopy = codeGetBox[0]?.() || initialText();
      if (!textToCopy) return;

      try {
        if (mode === "text") {
          await navigator.clipboard.writeText(textToCopy);
          toast.success("Auto-copied to clipboard");
        } else if (mode === "html") {
          const m = marked(textToCopy, { async: false });
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/html": new Blob([m], { type: "text/html" }),
            }),
          ]);
          toast.success("Auto-copied as HTML to clipboard");
        }
      } catch (err) {
        console.error("Auto copy failed", err);
        toast.error("Auto copy failed");
      }
    };
    window.addEventListener("focus", handleFocus);
    handleFocus();

    // Listen to changes
    console.log("Adding storage listener");
    const removeListener = addStorageChangeListener({
      clipboardHistory: (newText) => {
        console.log("CHANGE", newText);
        if (codeGetBox[0] && codeGetBox[0]() !== newText) {
          if (codeSetText[0]) {
            codeSetText[0](newText);
          }
        }
      },
      isRecording: (newVal) => {
        setIsRecording(newVal);
      },
      config: (newConfig) => {
        setConfig(newConfig);
      },
    });

    cleanUpFn = () => {
      removeListener();
      window.removeEventListener("focus", handleFocus);
    };
  });

  onCleanup(() => {
    cleanUpFn();
  });

  const handleClearClick = () => {
    const updatedHistory = "";
    setInitialText(updatedHistory);
    storeClipboardHistory(updatedHistory);
    if (codeSetText[0]) {
      codeSetText[0](updatedHistory);
    }
  };

  const toggleRecording = () => {
    const newVal = !isRecording();
    storeIsRecording(newVal);
  };

  const handleCopyClick = async () => {
    const textToCopy = codeGetBox[0]?.() || initialText();
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast.success("Copied to clipboard");
      } catch (err) {
        console.error("Copy failed", err);
        toast.error("Copy failed");
      }
    }
  };

  const handleCopyAsHtmlClick = async () => {
    const textToCopy = codeGetBox[0]?.() || initialText();
    if (textToCopy) {
      try {
        const m = marked(textToCopy, { async: false });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([m], { type: "text/html" }),
          }),
        ]);
        toast.success("Copied as HTML to clipboard");
      } catch (err) {
        console.error("Copy as HTML failed", err);
        toast.error("Copy as HTML failed");
      }
    }
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <div class="app-container">
        <div class="toolbar">
          <div class="toolbar-header">
            <div class="toolbar-actions">
              <button
                onClick={toggleRecording}
                class={`btn-record ${isRecording() ? "on" : "off"}`}
              >
                REC {isRecording() ? "ON" : "OFF"}
              </button>
              <button onClick={handleClearClick} class="btn-clear">
                Clear
              </button>
            </div>
            <div class="toolbar-actions">
              <button onClick={handleCopyClick} class={`btn-clear`}>
                <TbOutlineCopy />
                Copy
              </button>
              <button onClick={handleCopyAsHtmlClick} class={`btn-clear`}>
                <TbOutlineHtml />
                Copy HTML
              </button>
              <button
                onClick={() => setShowConfig(true)}
                class={`btn-clear`}
                style={{ padding: "4px" }}
              >
                ⚙️
              </button>
            </div>
          </div>
          <div class="toolbar-options">
            <div class="option-group">
              <label class="option-label">
                Format:
                <select
                  class="option-select"
                  value={config().contentsHandleOption}
                  onChange={(e) =>
                    updateConfig({
                      contentsHandleOption: e.currentTarget.value as any,
                    })
                  }
                >
                  {contentsHandleOptions.map((o) => (
                    <option value={o}>{o}</option>
                  ))}
                </select>
              </label>
            </div>
            <SepSelect
              label="Before"
              value={config().beforeSep}
              onChange={(newStrategy) =>
                updateConfig({ beforeSep: newStrategy })
              }
            />
            <SepSelect
              label="After"
              value={config().afterSep}
              onChange={(newStrategy) =>
                updateConfig({ afterSep: newStrategy })
              }
            />
          </div>
        </div>
        <div class="editor-container">
          {loaded() && (
            <CodeEdit
              language="markdown"
              initText={initialText()}
              codeGetBox={codeGetBox}
              codeSetText={codeSetText}
              onTextChange={(val) => {
                chrome.storage.local.set({ clipboardHistory: val });
              }}
            />
          )}
        </div>
      </div>
      {showConfig() && (
        <ConfigView
          config={config()}
          updateConfig={updateConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
};

export default App;
