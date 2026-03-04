import { createSignal, onMount, onCleanup, Component, Show } from "solid-js";
import "./App.css";
import { MsgCopySelection } from "@/core/message";
import {
  addStorageChangeListener,
  loadIsRecording,
} from "@/core/chrome-storage";
import { extractSelection } from "./extract";

const App: Component = () => {
  const [copied, setCopied] = createSignal(false);
  const [isRecording, setIsRecording] = createSignal(true);
  let timer: number;

  const handleCopy = () => {
    if (!isRecording()) return;

    const extracted = extractSelection();
    if (extracted && (extracted.text || extracted.html)) {
      // We let the default copy behavior happen so the clipboard gets populated naturally,
      // but we also send our carefully extracted payload to the background script.
      const msg: MsgCopySelection = {
        type: "copy-selection",
        payload: extracted,
      };
      chrome.runtime.sendMessage(msg);
    }

    setCopied(true);
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  let cleanUpFn = () => {};
  onMount(() => {
    window.addEventListener("copy", handleCopy);
    cleanUpFn = addStorageChangeListener({
      isRecording: (newVal) => {
        setIsRecording(newVal);
      },
    });
  });

  onMount(async () => {
    setIsRecording(await loadIsRecording());
  });

  onCleanup(() => {
    window.removeEventListener("copy", handleCopy);
    cleanUpFn();
  });

  return (
    <Show when={isRecording()}>
      <div class="bbond-container">
        <div class={`bbond-toast ${copied() ? "bbond-show" : "bbond-hide"}`}>
          BBONDED!
        </div>
        <div class="bbond-watching">BBONDing</div>
      </div>
    </Show>
  );
};

export default App;
