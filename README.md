# Service Desk AI walkthrough

An interactive React and TypeScript presentation with three views: a Service Desk AI architecture tour, a document-to-answer data-flow demonstration, and a drag-and-connect component builder.

Everything is scripted and runs locally. No API keys, environment files, database, backend service, or FFmpeg installation are needed to run the app.

## Quick start

Install **Node.js 22 or newer**, download or clone this repository, and open a terminal in the project folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Use **Architecture** and **Data flow** to switch views.

On Windows, if PowerShell blocks `npm.ps1`, run `npm.cmd install` and `npm.cmd run dev` instead.

## Using the presentation

- **Architecture:** a ten-scene, three-minute tour. Play or scrub the timeline, choose a scene, click components for explanations, drag to pan, and scroll to zoom. The original diagram, answer-reuse controls, and token sliders provide additional context.
- **Data flow:** an eleven-stage, 2 minute 34 second walkthrough of document ingestion and question answering. Choose VPN support or application access, inspect chunks, or try an editable prompt. Matching uses a regular expression; unsupported questions follow a scripted Service Desk handoff.
- **Component builder:** drag Chatbot or Knowledge search from the example Azure Artifacts library into the web application shell (or select **Add to shell**). Drag the component's AI port to Finance AI or Service Desk AI, or click the source port and then a service. Try the suggested question to see a scripted response and source for that domain. Move components by their titles, reconnect to switch domains, disconnect, remove, or reset. Escape cancels a pending connection. Bindings last while this view is open.
- **Keyboard:** Space plays or pauses; Left/Right moves between stages; Escape dismisses panels when focus is outside the relevant form controls.
- **Reduced motion:** available in each view's notes and initialized from your system preference.

The views can also be opened using the URL hashes `#architecture`, `#flows`, and `#builder`.

## Commands

| Command                | Purpose                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| `npm run dev`          | Start the local development server.                                        |
| `npm start`            | Start development with access from other devices on your network.          |
| `npm run typecheck`    | Check application, TypeScript export entry points, and Vite configuration. |
| `npm run format`       | Format source, configuration, scripts, and documentation.                  |
| `npm run format:check` | Check formatting without changing files.                                   |
| `npm run build`        | Type-check and build standalone HTML presentations.                        |
| `npm run preview`      | Serve the existing build on all network interfaces.                        |

Before committing changes, run:

```sh
npm run format:check
npm run build
```

There is no automated application test suite configured. For UI changes, also check playback, navigation, example switching, and the unsupported-question response in the browser.

## Project structure

```text
src/
  main.tsx                       # React entry point and stylesheet imports
  env.d.ts                       # Vite asset declarations
  app/App.tsx                    # View selection and hash navigation
  assets/reference.png           # Original architecture diagram
  styles/global.css              # Shared presentation styles
  shared/text-layout.ts          # Measured wrapping and bounded text layout
  features/
    architecture/
      ArchitectureDemo.tsx       # Architecture controls and dialogs
      Diagram.tsx                # SVG renderer
      model.ts                   # Graph, captions, timing, and cameras
      text-layout.ts             # Card typography shared with video exports
    data-flow/
      FlowDemo.tsx               # Data-flow controls and prompt editor
      flow-data.ts               # Example content and scripted answers
      flow-renderer.ts           # Canvas renderer shared with exports
      flows.css                  # Data-flow styles
scripts/
  build/                         # Standalone HTML packaging
  architecture/                  # Optional architecture video export
  data-flow/                     # Optional data-flow stills/video export
```

Keep feature-specific components and helpers in their feature folder. Use `src/app/` for application composition and `src/styles/` for shared styles. Content changes belong in `model.ts` or `flow-data.ts`. Timeline changes must stay aligned with the controls and export scripts.

Prettier and EditorConfig define the shared style: two-space indentation, single quotes, semicolons, UTF-8, and LF line endings. Long strings may exceed the formatter's 100-character target width.

## What to commit

Commit `src/`, `scripts/`, `index.html`, `package.json`, **`package-lock.json`**, this README, and the project configuration files. The lockfile makes dependency resolution repeatable; use `npm ci` for a clean install in CI.

`.gitignore` excludes dependencies, build output, temporary export files, logs, videos, archives, local environment files, and editor/OS files. Do not commit `node_modules/`, `dist/`, or `.work/`. They are generated locally. The source export scripts are retained as an optional feature and are not needed to start the development server.

## Build and share offline

```sh
npm run build
```

The build creates `dist/index.html` (architecture by default), `dist/data-flow.html` (data flow by default), and `dist/component-builder.html` (builder by default). Each embeds the JavaScript, CSS, and reference image and includes all three views. Open any file directly in a browser or share it for offline playback. External documentation links still need internet access.

Generated files should not be edited directly. Change the source and rebuild.

## Optional image and video exports

These commands are separate from the normal installation and development workflow. PNG previews use the installed Canvas dependency and require no FFmpeg:

```sh
npm run render:flow -- --stills
```

This writes stage previews, an application-access answer, and an unsupported-question example to `.work/data-flow/`.

For videos, install **FFmpeg with the `libx264` encoder** and put `ffmpeg` on your command-line PATH, then run:

```sh
npm run render:video -- ./service-desk-ai-silent.mp4
npm run render:flow -- ./service-desk-data-flow.mp4
```

Both exports are silent 1280 x 720 H.264 MP4 files at 20 fps. The architecture export is 180 seconds; data flow is 154 seconds using the default VPN example. Output paths are optional and default to the filenames shown. Create custom destination folders first; existing output files are replaced.

Export intermediates go into `.work/`. Architecture uses a separate Canvas renderer with shared graph data and cameras; data flow uses the same Canvas renderer as the browser. Available fonts can affect rendering. The scripts register Nimbus Sans as Arial when their configured Linux font files are available.

## Scope and assumptions

This is an illustrative concept presentation, not a live chatbot. It uploads no files and makes no AI or database calls. Embeddings, retrieved passages, responses, and token comparisons are scripted. The token comparison is not a total-cost forecast.

The component builder demonstrates the intended distribution and composition workflow: publish versioned React packages to an Azure Artifacts npm feed and a Spring Boot starter to a Maven feed, install/register the UI packages in a shell, and bind components to deployed Spring AI services. Feed names, package names and versions are examples; this repository does not publish them. A connection selects a backend service with its configured model, retrieval and approved domain knowledge. Spring AI is the integration framework, not the model itself. Production needs an authenticated backend, saved application bindings and actual feed configuration. The builder has one scripted sample question per domain; other prompts show an explicit demo fallback.

Production implementation would need document access filtering, cache eligibility checks, compatible embeddings, validated MongoDB/Spring AI integration, and an escalation path when evidence is missing. Conversation memory and answer reuse are separate concerns. Ingestion does not train the chat model. Model names shown are research candidates, not availability, pricing, or selection claims.

Framework references:

- [Spring AI retrieval-augmented generation](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html)
- [Spring AI MongoDB Vector Search integration](https://docs.spring.io/spring-ai/reference/api/vectordbs/mongodb.html)

# spring-ai-animated-presentation
