import { Component } from "solid-js";
import { AutoCopyOption, autoCopyOptions, Config } from "../core/options";
import pkg from "../../package.json";

type ConfigViewProps = {
  config: Config;
  updateConfig: (newConfig: Partial<Config>) => void;
  onClose: () => void;
};

const ConfigView: Component<ConfigViewProps> = (props) => {
  return (
    <div class="config-overlay">
      <div class="config-header">
        <h2 class="config-title">Settings</h2>
        <button onClick={props.onClose} class="btn-clear">
          ✖ Close
        </button>
      </div>

      <div class="config-body">
        <div class="config-item">
          <label class="config-item-label">Auto-copy on focus:</label>
          <select
            class="config-item-select"
            value={props.config.autoCopyOnFocus}
            onChange={(e) =>
              props.updateConfig({
                autoCopyOnFocus: e.currentTarget.value as AutoCopyOption,
              })
            }
          >
            {autoCopyOptions.map((o) => (
              <option value={o}>
                {o === "none"
                  ? "None"
                  : o === "text"
                    ? "As Raw Text"
                    : "As HTML"}
              </option>
            ))}
          </select>
        </div>

        <div class="config-item-checkbox-wrapper">
          <input
            type="checkbox"
            id="autoStartRecording"
            checked={props.config.autoStartRecordingOnFocus}
            onChange={(e) =>
              props.updateConfig({
                autoStartRecordingOnFocus: e.currentTarget.checked,
              })
            }
          />
          <label for="autoStartRecording" class="config-item-checkbox-label">
            Auto-start recording when focused
          </label>
        </div>

        <hr class="config-divider" />

        <div class="config-footer">
          <p>
            <strong>{pkg.name}</strong> v{pkg.version}
          </p>
          <p>
            <a href="https://github.com/lumiknit/bbond" target="_blank">
              GitHub / Help
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigView;
