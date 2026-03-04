import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    192: "public/web-app-manifest-192x192.png",
    512: "public/web-app-manifest-512x512.png",
  },
  action: {
    default_icon: {
      192: "public/web-app-manifest-192x192.png",
      512: "public/web-app-manifest-512x512.png",
    },
    default_popup: "src/ui/popup.html",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["https://*/*"],
      all_frames: true,
      match_about_blank: true,
    },
  ],
  permissions: ["sidePanel", "storage", "offscreen"],
  side_panel: {
    default_path: "src/ui/sidepanel.html",
  },
});
