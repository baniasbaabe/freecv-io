# FreeCV

A local desktop resume builder in the spirit of resume.io. It is built with Tauri 2, React and Tailwind, and runs on Windows, macOS and Linux.

- **Resume builder:** structured editor with a live A4 preview, a resume-strength meter that names the next useful step, and eight templates. Every template is single-column, with standard headings and inline dates, and is checked to extract in reading order with both pdfminer and pypdf. Six templates can show an optional header photo. You can pick an accent color, the PDF export has selectable text and clickable links, and deletes and AI rewrites can be undone.
- **Polish:** a line-by-line review in the style of polishme.ai, without chat. The AI proposes rewrites of the headline, summary, bullets and skills, each shown as a before/after with a short reason. You accept or decline each one, then apply them, or save them as a copy that leaves the original untouched. "Tailor to a job" rewrites the resume toward a specific job posting.
- **ATS check:** a Groq LLM scores how well applicant tracking systems can read the resume and lists concrete fixes.
- **Job match:** paste a job posting, or import it from a link, to get a fit score, matched and missing keywords, and suggested edits.
- **Cover letters:** generated with Groq from a resume and a job posting, editable, in three templates.

Photos are cropped to a square and downsized to 480 px JPEG before saving. Documents, photos and your API key are stored only on this machine, in the app's webview storage. The text you check is sent to Groq.

## Importing jobs from links (optional)

Job links are fetched on your machine with [Scrapling](https://github.com/D4Vinci/Scrapling)'s stealth browser, and Groq then extracts the posting from the page. Install it once:

```bash
pip install "scrapling[fetchers,rag]==0.4.15"
scrapling install
```

Use exactly version 0.4.15 with the `fetchers` and `rag` extras. Other versions may not have the `extract stealthy-fetch` command the app calls ("No such command 'stealthy-fetch'"). Without `rag`, Markdown conversion fails ("requires the markdownify package"). If you already have a different version, run the same `pip install` to replace it.

On Windows (PowerShell), pip installs per user to `%APPDATA%\Python\PythonXY\Scripts\scrapling.exe`, which isn't on PATH. Run `scrapling install` by its full path (adjust `Python313` to your version):

```powershell
python -m pip install --user "scrapling[fetchers,rag]==0.4.15"
& "$env:APPDATA\Python\Python313\Scripts\scrapling.exe" install
```

The app finds `scrapling.exe` in that folder by itself, so you don't need to set it in Settings.

If the app can't find the `scrapling` command (GUI apps don't always see your shell PATH), set its full path in **Settings**. Pages behind a login, such as some LinkedIn views, may not load; paste the text instead.

## Groq key

Create a free key at https://console.groq.com/keys and paste it in **Settings**. The default model is `llama-3.3-70b-versatile`. Click **Test key & load models** to choose another.

## Develop

Prerequisites: Node 20+, Rust, and the [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/). On Linux that means `libwebkit2gtk-4.1-dev`.

```bash
npm install
npm run tauri dev     # desktop app
npm run dev           # browser only, at http://localhost:1420 (AI calls depend on Groq allowing CORS)
npm test
npm run tauri build   # installers for the current OS, in src-tauri/target/release/bundle
```

### Windows

1. Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload. WebView2 already ships with Windows 10 and 11.
2. Install Rust and Node: `winget install Rustlang.Rustup OpenJS.NodeJS.LTS`, then `rustup default stable-msvc`.
3. Keep the repo on a Windows path such as `C:\Code\freecv-io`, not `\\wsl$\...`. If you copy it from WSL, leave out `node_modules` and `src-tauri/target`, because they contain Linux binaries.
4. In PowerShell:

   ```powershell
   npm.cmd install
   npm.cmd run tauri dev
   ```

   Use `npm.cmd` because the default PowerShell execution policy blocks `npm.ps1` ("Die Ausführung von Skripts ist auf diesem System deaktiviert"). To use plain `npm`, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. PowerShell chains commands with `;`, not `//`.

5. Optional, to import jobs from links: install Python (`winget install Python.Python.3.13`), then Scrapling as shown in [Importing jobs from links](#importing-jobs-from-links-optional).

**PDF export:** choose "Save as PDF" in the print dialog.

## Project structure

```
src/
  App.tsx              app shell: sidebar + current view
  hooks/               useStore (documents, settings, saving, undo-able actions), useAi (loading/error for one AI call)
  lib/                 framework-free logic: data model + migrations (tested), Groq client, photo, toast helper
  templates/           resume and cover-letter templates rendered to the A4 page
  components/          shared app pieces (Sidebar, Preview, JobInput…) and ui/ primitives (Field, Pick, Segmented, icons…)
  features/            one folder per screen: resume/ (editor, Polish, ATS, Job match), letter/, settings/
src-tauri/             Rust shell; src/scrape.rs runs Scrapling for job links
```

## Release builds

`.github/workflows/build.yml` builds Windows (.msi/.exe), macOS (Intel and Apple Silicon .dmg) and Linux (.deb/.rpm/.AppImage) installers. It runs when you push a `v*` tag or start it manually, and attaches them to a draft GitHub release. The builds are unsigned, so macOS Gatekeeper and Windows SmartScreen will warn on first launch.
