# AGENTS.md

Guide for agents (and humans) working on this repo. **Keep this file updated** as the experiment changes. If you change structure, file roles, stimuli, timing, or data saving, update the relevant section here in the same change.

## What this project is

An **Affective Misattribution Procedure (AMP)** built with **jsPsych 8**, deployed as a static site on **GitHub Pages** (`github.com/paulstillman/Beef-AMP`), and saving data to **Paul's Google Drive through DataPipe** (`@jspsych/extension-pipe`).

The research focus is **beef**. Primes are food images, followed by evaluatively ambiguous abstract paintings (targets) that participants rate as less or more pleasant than average. AMP logic: affect from the prime is misattributed to the neutral target. The broader project ("Temptation AMP") tests whether people's automatic attitudes toward beef can be updated. Messages/manipulations shown before the AMP are still to be drafted.

People: Paul Stillman (owner of this repo), Melissa Ferguson (Yale; PI), Arin Korkmaz (Yale; AMP expertise).

There is no build step, package manager, or test suite. Everything is plain HTML/CSS/JS loaded from CDNs.

## Status / where to pick up (last updated 2026-10-29)

- **Live:** https://paulstillman.github.io/Beef-AMP/ (deploys from `main`). Test URL: https://paulstillman.github.io/Beef-AMP/?pid=TEST_paul&nosave
- **Last verified (commit `524a8fb`, 2026-10-28):** the live site was run with `?nosave`. All images load from GitHub Pages, instructions → ready screen → AMP trials work, and responses land correctly on target or mask rows. A full 60-trial local run gave 20/20/20 trials, each prime image exactly 4 times, and 60 unique targets.
- **Kurdi timings switched on (2026-10-29):** fixation 500 (1000 on the first trial of each AMP block) → prime 100 → blank 100 → target 100 → mask until response.
- **AMP timing fix (2026-10-30):** Paul's real (saving) test run sometimes showed a long fixation and then a prime or target flashed too briefly or skipped. Cause: each screen was its own jsPsych trial, so main-thread work at screen changes could delay painting while the 100 ms timer kept running. The worst offender is likely the DataPipe extension streaming every trial (4–5 writes per AMP trial). Fix: `amp_trial_plugin.js` runs each AMP trial as **one** jsPsych trial. Images are pre-decoded, screens switch on animation frames, there's one data row (and one DataPipe write) per trial, and measured durations are saved. Streaming was also turned off (`stream: false`). Headless-Chrome frame timing tests (see "Timing tests" below):
  - **No load:** new version prime/blank/target 99–101 ms, fixation 499–501 ms (old version: 100–117 ms, with an extra frame on about half the screens).
  - **Simulated main-thread freezes** (random 150–300 ms blocks): no version can keep screens exact while the browser is frozen. The old version's screens stretched (prime up to about 390 ms) without any record. In the new version no screen ever ended early (minimum about 93 ms, i.e., 100 ms less half a frame), and stretched screens are recorded in `prime_ms` etc.
  - A first version of the plugin used rAF's frame timestamp and could cut a screen to one frame after a freeze. It now uses `performance.now()`. Don't switch back.
  - The exact "prime skipped" symptom wasn't reproduced locally (it needs real DataPipe streaming); with streaming off and the single-trial design, the remaining risk is stretching on a busy machine, which the data now records.
- **Re-test needed:** Paul should run the live site again (saving) and check `prime_ms`/`target_ms` in the CSV.
- **Not yet verified:** a *real* save to Google Drive. Do one full run without `?nosave`, confirm `<pid>.csv` appears in the DataPipe Drive folder, then delete it. Data collection must be switched on for the experiment in the DataPipe dashboard.
- **Possible stray file:** a local preview briefly loaded the page without `?nosave` on 2026-10-28, so a small `*.partial.json` may be in the Drive folder. It's safe to delete.
- **Full flow built (2026-10-29)** except consent. Paul is running it himself to time it.
- **Preload is strict:** if any image fails to download, jsPsych shows "The experiment failed to load." and the participant can't continue. This is unlikely on GitHub Pages. Decide whether to allow continuing (`continue_after_error`), at the risk of a missing image.
- **Next likely tasks:** fact-check learning statements, consent text, debrief, and the pre-AMP messages/manipulation.

## Overall study flow (Paul, 2026-10-29)

Modeled on a basic version of the "Kevin" studies (Cone, Flaharty & Ferguson, 2019, *PNAS*; Cone et al., 2021, *Psych Science*), minus diagnosticity manipulations and longitudinal follow-ups. Goal: see whether implicit attitudes toward beef can be moved.

1. Consent (text from Paul, pending)
2. Beef AMP, Time 1 (built)
3. Explicit attitudes toward beef, Time 1 (built; see "Explicit attitudes" below)
4. Learning phase (built 2026-10-29; statements in `learning_statements.md`, drafted from the slide deck `Research/beef_amp/tAMP_design_2024-04-15.pptx`, slides 8–9, then revised with Paul; still to be fact-checked). Participants judge statements about beef as **accurate** or **inaccurate** and get feedback. All feedback points to beef's negative health, environmental and ethical aspects. The Kevin version: 50 trials, C/U keys, feedback "correct" in blue or "incorrect" in red, followed by a one-line summary of the true answer.
5. Beef AMP, Time 2 (built 2026-10-29; brief reminder screen, no practice, 60 new targets: 5 + 60 + 60 = 125 of 200 used)
6. Explicit attitudes, Time 2 (built; same items, `explicit_time: 't2'`)

In the Kevin studies the AMP had 60 trials (30 Kevin, 30 neutral-stranger primes) and used D = less pleasant, K = more pleasant. The PDFs are in Dropbox at `Research/beef_amp/cone-et-al-2019-...pdf` and `cone-et-al-2021-...pdf`.

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
- (Decided 2026-10-29: 5 practice trials before AMP 1 only, primes A–E from the Commons shortlist, now in `img/practice/`.)
- (Decided 2026-10-29: participants come from and return to the lab's Qualtrics session router. See "Lab router".)

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
| `learning_items.js` | **Generated** by `build_learning.py` from `learning_statements.md` (defines `learning_items`). Loaded by `index.html`. Don't edit by hand. |
| `build_learning.py` | Parses `learning_statements.md` (`**E1.** statement`, `- Answer:`, `- Feedback source:`) into `learning_items.js`. **Rerun after every edit to the statements:** `python3 build_learning.py`. It prints counts per domain × accurate (should be 5 each). |
| `targets.js` | Old, unused (points at the deleted `img/targets/`). No longer loaded by `index.html`; safe to delete. |
| `learning_statements.md` | **Source of truth for the learning-phase statements** (30 drafts: environment/health/animal welfare × 5 accurate downsides + 5 inaccurate upside claims, each with answer, feedback line and source). Draft as of 2026-10-29; Paul/Melissa/Arin to edit and fact-check before it's built. Also lists problems with facts in the 2024 slide deck. |
| `explicit_questions.md` | **Source of truth for the explicit-attitude items** (wording, 1–7/1–9 scale, anchors, composite vs separate, page layout). Paul edits it; then update `exp.js` to match. |
| `resize_targets.py` | One-off PIL script that resized `img/targets/*` → `img/targets_resized/*` at 480×480. Uses `Image.ANTIALIAS` (removed in Pillow ≥10; use `Image.LANCZOS` if rerun). |
| `img/fixation.png` | Fixation image shown before each prime. |
| `img/ampmask.jpg` | Black-and-white noise backward mask (256×256, displayed stretched to 480×480 so it fully covers the target). |
| `img/targets_resized/pic1.png` … `pic200.png` | AMP targets: abstract paintings (480×480), the set Benedek Kurdi used. |
| `img/beef/` | Beef primes (5): `2patties_solo.jpeg`, `steak_1.jpeg`, `steak_3.jpeg`, `steak_8.jpeg`, `thickburger.jpeg`. |
| `img/chicken/` | Chicken primes (5): `fried_chicken_sandwich.jpg`, `full_chicken.jpeg`, `grilled_chicken.jpg`, `wings_1.jpeg`, `wings_2.jpeg`. |
| `img/desserts/` | Dessert primes (5): `apple_pie.jpeg`, `cake5.jpeg`, `cheesecake.jpeg`, `cookies.jpeg`, `ice_cream.png`. |
| `img/practice/` | Practice primes (5 plates/silverware photos from Wikimedia Commons, ≤480 px). `CREDITS.md` lists source, author and license for each; 3 are CC BY / CC BY-SA and need credit if materials are shared. |
| `img/old/` | Retired primes: `double-burger.jpeg`, `healthy/` (apples, bananas, blueberries, broccoli). |
| `img/scrambled/` | Empty locally (and untracked by git since it's empty). Possibly intended for scrambled-image control primes. |

All primes are ≤480 px on the longest side.

`.claude/launch.json` (committed) defines a local static server (`python3 -m http.server 8000`) for previewing in the Claude desktop app.

`.gitignore` only ignores `img/.DS_Store`; other `.DS_Store` files are committed.

## Current experiment flow (`exp.js`)

1. `initJsPsych` registers the DataPipe extension (see "Data saving" below). `on_finish` shows the raw data only when `?nosave` is in the URL. Otherwise participants see the extension's "Saving data…" then "Done. You may close this page." messages.
2. `pid` comes from the URL (sent by the lab router). If it's missing, it's self-generated as `SG_` + 12 random characters. Every row gets `pid`, `pid_source` (`url`/`self_generated`) and `survey_id` (`SV_BeefAMP`). The data file is `${pid}.csv`.
3. Settings: `timing` (Kurdi values: fixation 500 ms (`first_fixation` 1000 ms on trial 1 of each block), prime 100 ms, blank 100 ms, target 100 ms, mask until response), `n_reps_per_prime = 4`, `prime_images` (category → file list).
4. Trial lists, built before the timeline by `make_amp_trials(block_name, primes)`:
   - `practice_trials`: the 5 `practice_images` (plates/silverware, `prime_category: 'practice'`), each once, in random order. **Before AMP 1 only.**
   - `amp1_trials`, `amp2_trials`: each is a fresh `main_primes()` (every food prime × `n_reps_per_prime`, shuffled across categories; 60 trials).
   - Targets come from `take_targets(n)`, which pulls from a per-participant shuffled pool of pic1–pic200 (`target_pool`), so no painting repeats across practice, AMP 1 and AMP 2. 75 are left over.
   - Fields: `prime_category` (`beef`/`chicken`/`dessert`/`practice`), `prime_file`, `target_file`, `amp_block` (`practice`/`amp1`/`amp2`), `amp_trial` (1–n within block).
5. `preload`: all targets in use, all primes (including practice), fixation, mask.
6. `instructions` (jsPsychInstructions, Next/Previous buttons): two pages adapted nearly verbatim from Kurdi et al. Exp. 1, with E/I swapped for D/K and the influence-awareness page dropped. Then `practice_intro` (Kurdi's practice intro, space to start) → practice block → `test_ready` ("Good! The test phase will now begin. Keep going as before." + D/K reminder + "Ready? Press the space bar to begin."). All are tagged `trial_part: 'instructions'`. The timeline order is pushed in one line after `make_amp_block()` is defined.
7. `make_amp_block(trials)`: one `amp_trial` (custom plugin `jsPsychAmpTrial` in `amp_trial_plugin.js`) per row of `trials` (already in random order). Used for practice, AMP 1 and AMP 2.
   - The plugin puts fixation, prime, target and mask images in one stage (`.amp_stage`/`.amp_layer` in `amp.css`), waits until all are decoded, then shows them in turn by toggling `visibility` on `requestAnimationFrame` (switching when a screen has been up for its duration minus half a frame). Blank = nothing visible. D / "Less Pleasant" and K / "More Pleasant" labels stay at the bottom throughout.
   - Keys are ignored until target onset. A `d`/`k` during the target ends the trial (no mask). Otherwise the mask (stretched to 480×480) stays until `d`/`k`.
   - If the tab is hidden, animation frames pause, so the trial pauses too (and the measured durations show it).
8. `make_explicit('t1')`: beef page, then chicken/desserts page (see "Explicit attitudes" below).
9. Learning phase: `learning_intro`, then 30 × [`learning_statement`, `learning_feedback`] (see "Learning phase" below).
10. `amp2_intro` (reminder of the AMP instructions, space to start), AMP 2 block, then `make_explicit('t2')`.
11. `end_questions` (`beef_plan`, `eat_freq`, `hunger`), then `beef_restriction` (multi-select). End of study, asked once.
12. No save trial: the extension submits the full CSV automatically when the timeline ends.

### Explicit attitudes

Modeled on the Kevin studies' six-item composite: a "likeable" item (1 = very unlikeable to 7 = very likeable) plus five 7-point bipolar items (bad–good, mean–pleasant, disagreeable–agreeable, uncaring–caring, cruel–kind), averaged. Beef version (Claude's proposal, 2026-10-29). Paul is editing it in `explicit_questions.md`, which wins over this description and the code when they disagree. He wants most items on one page, using 1–7 or 1–9 scales depending on wording. Current implementation:
- `make_explicit(time)` builds both pages; it's called with `'t1'` (after AMP 1) and `'t2'` (after AMP 2). Rows carry `explicit_time` (`t1`/`t2`) and `explicit_page` (`beef`/`comparison`).
- Page 1, beef (jsPsychSurveyLikert, `scale_width: 900`): three groups in fixed order, shuffled within each group: attitude (`like` always first, then `good`/`positive`), ambivalence (`certainty`/`conflicted`/`confident`), other (`taste`/`healthy`/`env_friendly`/`ethical`). Defined in `beef_attitude`, `beef_ambivalence`, `beef_other`.
- Page 2, comparison: `like`/`good`/`positive` for chicken and for desserts (`chicken_like`, `dessert_good`, …, from `comparison_items()`). The two food blocks appear in random order, with items in fixed order within each.
- End of study (asked **once**, after explicit T2, last before the extension saves), both rows `trial_part == 'end_questions'`:
  - `end_questions` (Likert, 1–7, saved in columns of the same name): `beef_plan` ("Over the next month, I plan to eat..." 1 Much less beef … 4 The same amount of beef … 7 Much more beef; replaced `intend_reduce` on 2026-10-30, note that **higher = more beef**), `eat_freq` ("How often do you eat beef?", 1 Never … 7 Daily), `hunger` ("How hungry are you right now?", 1 Not at all hungry … 7 Extremely hungry; numbers only between).
  - `beef_restriction` (jsPsychSurveyMultiSelect, required, select all): "Is there anything that keeps you from eating beef (for example, religious, dietary, or medical reasons)?" Options: No / Religious / Vegetarian or vegan / Medical or health / Ethical or environmental / Other. Saved as `beef_restriction` (choices joined by "; ") and `beef_restricted` (1 if any option other than "No"). "No" plus another option isn't prevented.
- All items are 1–7 for now. Wording and labels are in `explicit_questions.md`.
- Labels: bipolar items label every point "N<br>phrase" (built by `bipolar_labels(low, high, mid)`). The midpoint breaks before "nor" ("Neither negative<br>nor positive"). Unipolar "not at all … very" items label only points 1 and 7 (`unipolar_labels(low, high)`).
- All items are required. Each answer is saved as 1–7 in its own column (`explicit_like`, `explicit_good`, …) on the two rows with `trial_part == 'explicit'`. Each row's `explicit_order` lists that page's item names in display order.
- `amp.css` has a rule at the bottom that undoes the old global `input { width:200px; height:50px }` for these radio buttons.

### Data saving (DataPipe → Google Drive)

- DataPipe experiment ID **`4OEY2BEtOzsk`** (Google Drive storage, created 2026-10-28). Files land in a folder for the experiment under `My Drive/DataPipe/` (or a parent folder Paul chose), in `data/`.
- The old OSF experiment `0fKnOsyHzKUQ` is retired. DataPipe stops writing to OSF after 2026-11-16. Anything it collected stays on OSF.
- Uses `@jspsych/extension-pipe@0.2.0`, registered in `initJsPsych({ extensions: [...] })`, with **`stream: false`** (Paul, 2026-10-30): no per-trial writes, just one submission of `${pid}.csv` at the end. Streaming was turned off because its per-trial network work competes with the 100 ms AMP screens. Consequence: participants who quit partway leave **no data** (no `.partial.json` files).
- **`?nosave` URL flag** sets the extension's `enabled: false`: no session, no streaming, no submission. Use it for all testing.
- The extension and jsPsych 8 go together. The old `@jspsych-contrib/plugin-pipe` save trial is gone, and versions ≥0.5 of that plugin need jsPsych 8 anyway.
- Docs: https://pipe.jspsych.org/docs (see "What's changed", "Saving as you go").

### Learning phase

- Items come from `learning_items` (generated; see file map): 30 statements, environment/health/animal welfare × 5 accurate (beef downsides) + 5 inaccurate (claimed upsides). Every statement is beef- or red-meat-specific.
- `learning_trials`: statements shuffled per participant. Each gets a beef photo from `prime_images.beef` (5 images × 6 = 30, shuffled), shown above the statement like Kevin's photo in Cone et al.
- `learning_statement`: image + statement, keys **A = accurate**, **I = inaccurate**, labels at bottom left/right.
- `learning_feedback`: same image + statement, then "Correct" (blue) / "Incorrect" (red), "This statement is accurate/inaccurate.", "Source: …". Space to continue (no minimum time).
- Data (`trial_part` `learning` and `learning_feedback`): `learning_trial` (1–30), `learning_item` (E1…A10), `learning_domain`, `learning_accurate`, `learning_image`. Statement rows also have `response` (a/i), `rt`, `said_accurate`, `learning_correct`. Feedback rows' `rt` is reading time.
- Styles: `.learning_*` classes at the bottom of `amp.css`.

### Lab router (Qualtrics)

Participants run in the lab's Qualtrics **session router** (Paul's `qualtrics-router` skill; the router's own docs are in that skill). The router chains each week's studies from a Google Sheet and passes a `pid` (the router's Response ID, or `PREVIEW_R_...` for preview runs) to each study.
- **In:** the router sends participants to this study's link with `?pid=...` (sometimes plus `&Q_CHL=preview`, which we ignore).
- **Out:** `on_finish` (which runs after the DataPipe upload completes) redirects to `ROUTER_URL?from=SV_BeefAMP&pid=<pid>`. With `?nosave` it shows the data and logs the would-be redirect to the console instead.
- **`SURVEY_ID = 'SV_BeefAMP'`** is a fixed made-up ID standing in for a Qualtrics SurveyID, because the router identifies studies by an `SV_\w+` match in their sheet link. **The sheet's Study Link for this study must be `https://paulstillman.github.io/Beef-AMP/?study=SV_BeefAMP`.** The router finds `SV_BeefAMP` in the query string, strips the query, and sends people to the bare link plus `?pid=...`. Don't change the ID without updating the sheet.
- `ROUTER_URL` = `https://bostonu.qualtrics.com/jfe/form/SV_bPg2NmkSI0V5hwW` (from the router config in Dropbox at `LLM_projects/qualtrics_router/router_config.json`).
- Self-generated `SG_` pids (no router) still redirect to the router. With an unknown pid it just records the hop and sends them to the final (demographics) survey.
- Preview runs (`pid` starting `PREVIEW_`) **do** save to Drive. Filter them out in analysis.

### Data columns added by the AMP

**One row per AMP trial** (since 2026-10-30), `trial_part == 'amp'`: `amp_block` (`practice`/`amp1`/`amp2`), `amp_trial`, `prime_category` (`beef`/`chicken`/`dessert`/`practice`), `prime_file`, `target_file`, `response` (d/k), `rt` (**ms from target onset**), `pleasant` (1 = k, 0 = d), `responded_during` (`target`/`mask`), and the measured on-screen durations `fixation_ms`, `prime_ms`, `blank_ms`, `target_ms` (target_ms runs until mask onset, or until the response if it came during the target), plus `frame_ms` (median frame interval, about 16.7 on a 60 Hz screen). **RT is measured from target (painting) onset**, not fixation onset. Keys before target onset are ignored. A response during the target gives `rt` < ~100. A response during the mask still counts from target onset, so it includes the ~100 ms target. For RT from fixation onset: `fixation_ms + prime_ms + blank_ms + rt`. (`time_elapsed` is jsPsych's time since experiment start, taken when the trial ended.) For analysis, filter `trial_part == "amp"` and `amp_block != "practice"`. For **timing QC**, flag trials whose `prime_ms` or `target_ms` is far from 100 (e.g., outside 80–125).

### Timing tests

`timing_test.py` (kept in Claude's scratchpad, not the repo; easy to recreate) runs the experiment in headless Chrome. Serve the folder with a threaded server with a large request queue (Python's `http.server` resets connections under the ~140 parallel preload requests, which makes preload fail with "The experiment failed to load."). The harness (`--headless=new`, driven over the DevTools protocol with `websocket-client`), logs which screen is visible on every animation frame, and reports per-trial fixation/prime/blank/target durations. It can add simulated main-thread load (blocking bursts at random times) to mimic the DataPipe streaming. Results from 2026-10-30 are summarized in the chat history and in the Status section.

## Known issues / unfinished work

Updated 2026-10-29. Confirm with Paul before "fixing" design choices.

- **Learning statements not fact-checked yet**: see the "verify" notes in `learning_statements.md`.
- **No consent or debrief.** AMP instructions are in (see flow step 6).
- **Prime repeats aren't spread out.** The 60 trials are fully shuffled, so the same image can appear on back-to-back trials. Kurdi instead cycled through the prime set without replacement. Revisit if that matters.
- **Key-side counterbalancing** is not implemented (D is always "Less Pleasant"). Kurdi didn't counterbalance either.
- **Unused files:** `targets.js` (still loaded by `index.html`), `exp_old_working.js`, the commented-out canvas demo in `index.html`, and most of `amp.css`.
- `amp.css` imports Google Fonts over `http://`, which browsers block as mixed content on GitHub Pages (https). Harmless, since text falls back to Open Sans/Arial, but worth cleaning up.

## Conventions / how to work here

- **Local testing:** serve the folder over HTTP (e.g. `python3 -m http.server`) and open `http://localhost:8000/?pid=TEST_paul&nosave`. **Always include `nosave`**: without it, merely loading the page opens a real DataPipe session and starts streaming trials into Paul's Drive. Note that the preview server in `.claude/launch.json` opens the bare URL first, so navigate to the `?nosave` URL right away.
- **Deployment:** push to `main`; GitHub Pages serves the repo root. All paths are relative (`./img/...`), so keep them that way.
- Code style in `exp.js`: plain globals, `var`/`let` mixed, timeline objects pushed to `timeline` one at a time. Match it unless refactoring on purpose.
- Versions are pinned in `index.html`: jspsych 8.3.0, plugin-instructions 2.1.0, plugin-html-keyboard-response 2.2.0, plugin-survey-likert 2.2.0, plugin-preload 2.1.0, plugin-fullscreen 2.1.0 (loaded, unused), extension-pipe 0.2.0. Use jsPsych **v8** docs. In v8, read timeline variables inside functions with `jsPsych.evaluateTimelineVariable('x')`. `jsPsych.timelineVariable('x')` is only for plain parameter values (as in `amp_data()`).
- When adding or swapping primes, edit `prime_images` in `exp.js` and resize the files first. Preload and trial counts pick them up automatically (trials per category = images × `n_reps_per_prime`).
- To test without sending data, use `?nosave` (see above). In the browser console, `practice_trials`, `amp1_trials`, `target_pool` and `jsPsych.data.get()` are handy for checking.
- To skip ahead while testing, run `jsPsych.abortCurrentTimeline()` in the console **while inside an AMP or learning block**, then press a response key. In jsPsych 8 the abort only takes effect when the current trial ends, and a pending abort on a later screen (e.g., a survey page) ends the whole experiment.
- Browsers cache `amp.css`/`exp.js` aggressively on the local server, so hard-reload after editing.
- **Paul's browser has a Vim-style extension (Vimium).** In its normal mode it captures single-letter keys (D/K scroll, I = insert mode) before the page sees them, so the AMP and learning keys seem dead. When testing, exclude `https://paulstillman.github.io/*` in Vimium, use a private window, or press `i` first. This isn't an experiment bug.
- `amp_trial_plugin.js` reads D/K with its own window-level (capture) keydown listener, not jsPsych's `getKeyboardResponse`, so responses work even if keyboard focus leaves jsPsych's display element (checked with real CDP key events, 2026-10-30). It also refocuses the display element at the start of each trial.
