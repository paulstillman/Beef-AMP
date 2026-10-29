# AGENTS.md

Guide for agents (and humans) working on this repo. **Keep this file updated** as the experiment changes. If you change structure, file roles, stimuli, timing, or data saving, update the relevant section here in the same change.

## What this project is

An **Affective Misattribution Procedure (AMP)** built with **jsPsych 8**, deployed as a static site on **GitHub Pages** (`github.com/paulstillman/Beef-AMP`), and saving data to **Paul's Google Drive through DataPipe** (`@jspsych/extension-pipe`).

The research focus is **beef**. Primes are food images, followed by evaluatively ambiguous abstract paintings (targets) that participants rate as less or more pleasant than average. AMP logic: affect from the prime is misattributed to the neutral target. The broader project ("Temptation AMP") tests whether people's automatic attitudes toward beef can be updated. Messages/manipulations shown before the AMP are still to be drafted.

People: Paul Stillman (owner of this repo), Melissa Ferguson (Yale; PI), Arin Korkmaz (Yale; AMP expertise).

There is no build step, package manager, or test suite. Everything is plain HTML/CSS/JS loaded from CDNs.

## Status / where to pick up (last updated 2026-10-29)

- **Live:** https://paulstillman.github.io/Beef-AMP/ (deploys from `main`). Test URL: https://paulstillman.github.io/Beef-AMP/?workerId=test&nosave
- **Last verified (commit `524a8fb`, 2026-10-28):** the live site was run with `?nosave`. All images load from GitHub Pages, instructions → ready screen → AMP trials work, and responses land correctly on target or mask rows. A full 60-trial local run gave 20/20/20 trials, each prime image exactly 4 times, and 60 unique targets.
- **Kurdi timings switched on (2026-10-29):** fixation 500 → prime 100 → blank 100 → target 100 → mask until response. A full 60-trial local `?nosave` run measured fixation ~509 ms and prime/blank/target ~105 ms each (the extra ~5 ms is jsPsych overhead). Not yet checked on the live site.
- **Not yet verified:** a *real* save to Google Drive. Do one full run without `?nosave`, confirm `<workerId>.csv` appears in the DataPipe Drive folder, then delete it. Data collection must be switched on for the experiment in the DataPipe dashboard.
- **Possible stray file:** a local preview briefly loaded the page without `?nosave` on 2026-10-28, so a small `*.partial.json` may be in the Drive folder. It's safe to delete.
- **Next likely tasks:** practice trials, end-of-study redirect, consent/debrief, and the pre-AMP messages/manipulation.

## Agreed study design (from the Paul / Melissa / Arin email thread, Mar–Apr 2024)

- **Three prime categories, 20 trials each (20-20-20 = 60 trials):**
  - **Beef** (focal; red meat, tasty/"unhealthy"): burgers, steaks.
  - **Chicken** (control 1; meat but "healthier", still tasty): e.g., grilled chicken, chicken or turkey sandwiches, wings. Arin suggested leaning toward grilled chicken / sandwiches.
  - **Dessert** (control 2; non-meat, tasty/indulgent): controls for "tasty/fun" positivity so differences can be attributed to food type. Chosen over fruit/healthy foods (those now live in `img/old/healthy/`).
- **Don't use the brownie image.** It looked too much like steak (already deleted).
- **Add a backward mask** after the target (Arin flagged it as missing). Done: `img/ampmask.jpg`.
- **Resize all prime images** to be small (≤480 px on the longest side) before use. Huge images (e.g., 5000×4000 px, 5 MB) took 100–200 ms for the browser to rescale, which made primes look skipped or shortened. All current primes are resized; resize any new ones the same way (`sips -Z 480 <file>` on macOS; sips can't write .webp, so convert those to .jpeg).
- **Targets:** the abstract paintings currently in `img/targets_resized/` are the set Benedek Kurdi used in a published large-N study. Arin says they're fine as long as the randomization is handled properly (each participant gets random targets, each target used once).
- A sibling study (harmful/harmless labels instead of pleasant/unpleasant, for a different person-perception project) lives in a separate repo. It's not this one.

Decisions (Paul, 2026-10-28):
- **5 images per category, each shown 4 times** → 20 trials per category, 60 total. All 60 trials are shuffled together.
- **Timings follow Kurdi et al. (2023)** (below). Switched from the slow testing values on 2026-10-29.
- **Keep D / K** as the response keys (not Kurdi's E / I).

- **Save to Google Drive via DataPipe**, with each trial streamed as it happens (needs jsPsych 8; upgraded 2026-10-28).
- Mask image `img/ampmask.jpg` provided by Paul.

Still undecided (ask Paul before doing):
- Practice trials: how many, and which primes.
- Where participants go when they finish (redirect URL).

## Reference procedure: Kurdi et al. (2023), *Behavior Research Methods* 56:3161–3194

Paul shared this as the methodological reference (Ferguson-lab AMP; Arin is a coauthor). Ignore its trial-by-trial "influence awareness" judgments; that part isn't needed here. Their Experiment 1 AMP:

- Instructions: a real-life image (prime) is followed by an abstract painting (target). Judge how *visually pleasant* each painting is compared with average, and ignore the first image ("simply a warning signal"). Participants are told primes might bias them and to do their best to resist this.
- Trial: fixation cross **500 ms** → prime **100 ms** → blank **100 ms** → target (abstract painting) **100 ms** → black-and-white **pattern mask until response**.
- Keys: **E** = less pleasant than average, **I** = more pleasant than average.
- 10 practice trials (dropped from analysis), then 70 experimental trials (35 per prime type).
- Primes sampled randomly without replacement; when the set is used up, sampling restarts. Each target used on only one trial. Trial order randomized per participant.
- DV: proportion of "pleasant" responses per prime type; the AMP effect is the difference between prime types.

Source PDFs are outside the repo, in Paul's Dropbox at `Research/beef_amp/kurdi_2023/` (paper and "Instructions and Measures" with verbatim instruction text). The email thread is at `Research/beef_amp/Gmail - Temptation AMP project.pdf`. The Dropbox root path may differ on another computer.

## File map

| Path | Role |
|---|---|
| `index.html` | Entry point. Loads jsPsych + plugins from unpkg, `targets.js`, `amp.css`, then `exp.js`. Contains a large commented-out canvas demo that can be removed. |
| `exp.js` | **The experiment.** Settings block at the top (`timing`, `n_reps_per_prime`, `prime_images`), then builds the trial list and timeline and calls `jsPsych.run`. This is the file to edit. |
| `exp_old_working.js` | Older snapshot of `exp.js` (prime 1000 ms, older `container_amp` layout). Reference only; not loaded. |
| `amp.css` | Styles. Mostly inherited boilerplate from an earlier mouse-tracking project (questionnaire, radio buttons, `mt-response-btn`, etc.). The AMP actually uses `.container_amp_v2`, `.image_amp_v2`, `.text_left_v2`, `.text_right_v2`. The `v1` classes (`.container_amp`, `.text_left`, ...) are used only by `exp_old_working.js`. |
| `targets.js` | Defines `all_targets` (pic1–pic200) pointing at `./img/targets/`, a folder that **no longer exists**. Loaded by `index.html` but **not used** by `exp.js`. Likely removable. |
| `resize_targets.py` | One-off PIL script that resized `img/targets/*` → `img/targets_resized/*` at 480×480. Uses `Image.ANTIALIAS` (removed in Pillow ≥10; use `Image.LANCZOS` if rerun). |
| `img/fixation.png` | Fixation image shown before each prime. |
| `img/ampmask.jpg` | Black-and-white noise backward mask (256×256, displayed stretched to 480×480 so it fully covers the target). |
| `img/targets_resized/pic1.png` … `pic200.png` | AMP targets: abstract paintings (480×480), the set Benedek Kurdi used. |
| `img/beef/` | Beef primes (5): `2patties_solo.jpeg`, `steak_1.jpeg`, `steak_3.jpeg`, `steak_8.jpeg`, `thickburger.jpeg`. |
| `img/chicken/` | Chicken primes (5): `fried_chicken_sandwich.jpg`, `full_chicken.jpeg`, `grilled_chicken.jpg`, `wings_1.jpeg`, `wings_2.jpeg`. |
| `img/desserts/` | Dessert primes (5): `apple_pie.jpeg`, `cake5.jpeg`, `cheesecake.jpeg`, `cookies.jpeg`, `ice_cream.png`. |
| `img/old/` | Retired primes: `double-burger.jpeg`, `healthy/` (apples, bananas, blueberries, broccoli). |
| `img/scrambled/` | Empty locally (and untracked by git since it's empty). Possibly intended for scrambled-image control primes. |

All primes are ≤480 px on the longest side.

`.claude/launch.json` (committed) defines a local static server (`python3 -m http.server 8000`) for previewing in the Claude desktop app.

`.gitignore` only ignores `img/.DS_Store`; other `.DS_Store` files are committed.

## Current experiment flow (`exp.js`)

1. `initJsPsych` registers the DataPipe extension (see "Data saving" below). `on_finish` shows the raw data only when `?nosave` is in the URL. Otherwise participants see the extension's "Saving data…" then "Done. You may close this page." messages.
2. Subject ID from URL param `workerId`, else a random 10-char ID. Stored as `subject_id`; data filename is `${sub_id}.csv`.
3. Settings: `timing` (Kurdi values: fixation 500 ms, prime 100 ms, blank 100 ms, target 100 ms, mask until response), `n_reps_per_prime = 4`, `prime_images` (category → file list).
4. Trial list (`amp_trials`, built before the timeline): every prime image × `n_reps_per_prime`, shuffled across categories. Each trial gets a unique target sampled without replacement from pic1–pic200. Fields: `prime_category`, `prime_file`, `target_file`, `amp_trial` (1–60).
5. `preload` — all targets in use, all primes, fixation, mask.
6. `instructions` (jsPsychInstructions, Next/Previous buttons): two pages adapted nearly verbatim from Kurdi et al. Exp. 1, with E/I swapped for D/K and the influence-awareness page dropped. Then `test_ready`: a D/K reminder, "Ready? Press the space bar to begin." (space only). Both are tagged `trial_part: 'instructions'`. A TODO comment holds Kurdi's practice-intro and "Good! The test phase will now begin" text for when practice trials are added.
7. `amp_block` — `[fixation, prime_screen, blank_screen, target_screen, mask_if_needed]` run over `timeline_variables: amp_trials` (already in random order).
   - Every screen uses `amp_screen(img)`: the image centered, with D / "Less Pleasant" bottom-left and K / "More Pleasant" bottom-right. The blank screen is `amp_screen(null)`, which keeps the key labels but shows no image. Keys pressed during fixation, prime or blank are ignored.
   - `target_screen` shows for `timing.target` and accepts `d`/`k`. A press ends the trial and the mask is skipped (`mask_if_needed` is a conditional timeline that runs only if the target row has no response). Otherwise `mask_screen` stays up until `d`/`k`.
   - Whichever row got the response (target or mask) gets `pleasant` (1 = k, 0 = d) and `rt_from_target` (ms from target onset; for mask rows = `timing.target` + mask `rt`).
8. No save trial: the extension submits the full CSV automatically when the timeline ends.

### Data saving (DataPipe → Google Drive)

- DataPipe experiment ID **`4OEY2BEtOzsk`** (Google Drive storage, created 2026-10-28). Files land in a folder for the experiment under `My Drive/DataPipe/` (or a parent folder Paul chose), in `data/`.
- The old OSF experiment `0fKnOsyHzKUQ` is retired. DataPipe stops writing to OSF after 2026-11-16. Anything it collected stays on OSF.
- Uses `@jspsych/extension-pipe@0.2.0`, registered in `initJsPsych({ extensions: [...] })`. It **streams each trial** as it finishes, then submits `${sub_id}.csv` at the end. A participant who quits partway leaves a `<filename>-<id>.partial.json` file instead. Treat those as non-completers in analysis, and mention partial-data retention in the IRB protocol.
- **`?nosave` URL flag** sets the extension's `enabled: false`: no session, no streaming, no submission. Use it for all testing.
- The extension and jsPsych 8 go together. The old `@jspsych-contrib/plugin-pipe` save trial is gone, and versions ≥0.5 of that plugin need jsPsych 8 anyway.
- Docs: https://pipe.jspsych.org/docs (see "What's changed", "Saving as you go").

### Data columns added by the AMP

On every fixation/prime/blank/target/mask row (via `amp_data()`): `trial_part` (`fixation`/`prime`/`blank`/`target`/`mask`), `amp_trial`, `prime_category` (`beef`/`chicken`/`dessert`), `prime_file`, `target_file`. The response row (target **or** mask, per above) also has `response`, `rt` (from that screen's onset), `pleasant`, `rt_from_target`. For analysis, keep rows where `pleasant` is not missing. That gives exactly one row per AMP trial; use `trial_part` to see whether the response came during the target or the mask.

## Known issues / unfinished work

Updated 2026-10-28. Confirm with Paul before "fixing" design choices.

- **No practice trials** (pending).
- **No consent or debrief.** AMP instructions are in (see flow step 6).
- **Prime repeats aren't spread out.** The 60 trials are fully shuffled, so the same image can appear on back-to-back trials. Kurdi instead cycled through the prime set without replacement. Revisit if that matters.
- **Key-side counterbalancing** is not implemented (D is always "Less Pleasant"). Kurdi didn't counterbalance either.
- **No end-of-study redirect** (e.g. back to Qualtrics/Prolific). Add it in `on_finish`; the extension finishes uploading before `on_finish` runs.
- **Unused files:** `targets.js` (still loaded by `index.html`), `exp_old_working.js`, the commented-out canvas demo in `index.html`, and most of `amp.css`.
- `amp.css` imports Google Fonts over `http://`, which browsers block as mixed content on GitHub Pages (https). Harmless, since text falls back to Open Sans/Arial, but worth cleaning up.

## Conventions / how to work here

- **Local testing:** serve the folder over HTTP (e.g. `python3 -m http.server`) and open `http://localhost:8000/?workerId=test&nosave`. **Always include `nosave`**: without it, merely loading the page opens a real DataPipe session and starts streaming trials into Paul's Drive. Note that the preview server in `.claude/launch.json` opens the bare URL first, so navigate to the `?nosave` URL right away.
- **Deployment:** push to `main`; GitHub Pages serves the repo root. All paths are relative (`./img/...`), so keep them that way.
- Code style in `exp.js`: plain globals, `var`/`let` mixed, timeline objects pushed to `timeline` one at a time. Match it unless refactoring on purpose.
- Versions are pinned in `index.html`: jspsych 8.3.0, plugin-instructions 2.1.0, plugin-html-keyboard-response 2.2.0, plugin-preload 2.1.0, plugin-fullscreen 2.1.0 (loaded, unused), extension-pipe 0.2.0. Use jsPsych **v8** docs. In v8, read timeline variables inside functions with `jsPsych.evaluateTimelineVariable('x')`. `jsPsych.timelineVariable('x')` is only for plain parameter values (as in `amp_data()`).
- When adding or swapping primes, edit `prime_images` in `exp.js` and resize the files first. Preload and trial counts pick them up automatically (trials per category = images × `n_reps_per_prime`).
- To test without sending data, use `?nosave` (see above). In the browser console, `amp_trials` and `jsPsych.data.get()` are handy for checking.
