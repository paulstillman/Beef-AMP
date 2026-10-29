
// add ?nosave to the URL when testing: nothing is sent to DataPipe and the
// raw data is shown at the end instead
const NOSAVE = new URLSearchParams(location.search).has('nosave');

// DataPipe (Google Drive) via the pipe extension: each trial is streamed as it
// happens, and the full CSV is submitted when the experiment ends
const jsPsych = initJsPsych({
  extensions: [
    {
      type: jsPsychExtensionPipe,
      params: {
        experiment_id: "4OEY2BEtOzsk",
        filename: () => `${sub_id}.csv`,
        enabled: !NOSAVE,
      },
    },
  ],
  on_finish: function () {
    if (NOSAVE) jsPsych.data.displayData();
  },
});


let sub_id = jsPsych.data.getURLVariable('workerId');
if (sub_id === undefined) {
  sub_id = jsPsych.randomization.randomID(10);
}
jsPsych.data.addProperties({ subject_id: sub_id });


let timeline = [];


/* ---------- settings ---------- */

// durations in ms, following Kurdi et al. (2023), Exp. 1
const timing = {
  fixation: 500,
  prime: 100,
  blank: 100,
  target: 100,
  // mask stays up until response
};

const n_reps_per_prime = 4; // 5 images x 4 reps = 20 trials per category
const n_targets_available = 200;

const prime_images = {
  beef: [
    './img/beef/2patties_solo.jpeg',
    './img/beef/steak_1.jpeg',
    './img/beef/steak_3.jpeg',
    './img/beef/steak_8.jpeg',
    './img/beef/thickburger.jpeg',
  ],
  chicken: [
    './img/chicken/fried_chicken_sandwich.jpg',
    './img/chicken/full_chicken.jpeg',
    './img/chicken/grilled_chicken.jpg',
    './img/chicken/wings_1.jpeg',
    './img/chicken/wings_2.jpeg',
  ],
  dessert: [
    './img/desserts/apple_pie.jpeg',
    './img/desserts/cake5.jpeg',
    './img/desserts/cheesecake.jpeg',
    './img/desserts/cookies.jpeg',
    './img/desserts/ice_cream.png',
  ],
};


/* ---------- build trial list ---------- */

// every prime image repeated n_reps_per_prime times, shuffled together across categories
const prime_trials = jsPsych.randomization.shuffle(
  Object.entries(prime_images).flatMap(([category, files]) =>
    files.flatMap(file =>
      Array(n_reps_per_prime).fill({ prime_category: category, prime_file: file })
    )
  )
);

// each target painting used on at most one trial
const target_nums = jsPsych.randomization.sampleWithoutReplacement(
  Array.from({ length: n_targets_available }, (_, i) => i + 1),
  prime_trials.length
);

const amp_trials = prime_trials.map((t, i) => ({
  ...t,
  target_file: `./img/targets_resized/pic${target_nums[i]}.png`,
  amp_trial: i + 1,
}));


/* ---------- trials ---------- */

var preload = {
  type: jsPsychPreload,
  images: amp_trials.map(t => t.target_file)
    .concat(Object.values(prime_images).flat(), ['./img/fixation.png', './img/ampmask.jpg']),
};
timeline.push(preload);

/* ---------- instructions (adapted from Kurdi et al., 2023, Exp. 1) ---------- */

var instr_page1 = `<div class='instructions'>
<p>This study examines how people make simple judgments.</p>
<p>During the task, you will see pairs of pictures appear one after the other.</p>
<p>The first picture will be a real-life image and the second picture will be an abstract painting.</p>
<p>The first image is simply a warning signal for the abstract painting and should be ignored.</p>
<p>Your task is to judge how visually pleasant each abstract painting is.</p>
</div>`;

var instr_page2 = `<div class='instructions'>
<p>Put your index fingers on the D and K keys of your keyboard.</p>
<p>If the abstract painting is <b>less</b> visually pleasant than average, please press the <b>D</b> key on the left.</p>
<p>If the abstract painting is <b>more</b> visually pleasant than average, please press the <b>K</b> key on the right.</p>
<p>Note that the first (real-life) image can sometimes bias judgments of the abstract paintings.
Please try your absolute best not to let the real-life images bias your judgment of the abstract paintings.</p>
</div>`;

var instructions = {
  type: jsPsychInstructions,
  pages: [instr_page1, instr_page2],
  show_clickable_nav: true,
  data: { trial_part: 'instructions' },
};
timeline.push(instructions);

// TODO once practice trials exist: practice intro ("We will now provide you with an opportunity
// to practice the task...") before practice, then "Good! The test phase will now begin.
// Keep going as before." before this reminder.
var test_ready = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<div class='instructions'>
    <p>As a reminder: If the abstract painting is less visually pleasant than average, press the D key.
    And if it is more visually pleasant than average, press the K key.</p>
    <p>Ready? Press the space bar to begin.</p>
  </div>`,
  choices: [' '],
  data: { trial_part: 'instructions' },
};
timeline.push(test_ready);


// tags every row (fixation, prime, target, mask) with the trial's prime/target info
function amp_data(trial_part) {
  return {
    trial_part: trial_part,
    amp_trial: jsPsych.timelineVariable('amp_trial'),
    prime_category: jsPsych.timelineVariable('prime_category'),
    prime_file: jsPsych.timelineVariable('prime_file'),
    target_file: jsPsych.timelineVariable('target_file'),
  };
}

// img_style lets the 256px mask be stretched to cover the 480px targets.
// img_src = null gives the blank screen (key labels only)
function amp_screen(img_src, img_style = '') {
  const img = img_src === null ? '' : `<img src="${img_src}" class="image_amp_v2" style="${img_style}">`;
  return `
    <div class="container_amp_v2">
      ${img}
      <div class="text_left_v2">D<br>Less Pleasant</div>
      <div class="text_right_v2">K<br>More Pleasant</div>
    </div>`;
}

var fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: amp_screen('./img/fixation.png'),
  choices: "NO_KEYS",
  trial_duration: timing.fixation,
  data: amp_data('fixation'),
};

var prime_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => amp_screen(jsPsych.evaluateTimelineVariable('prime_file')),
  choices: "NO_KEYS",
  trial_duration: timing.prime,
  data: amp_data('prime'),
};

var blank_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: amp_screen(null),
  choices: "NO_KEYS",
  trial_duration: timing.blank,
  data: amp_data('blank'),
};

// response can come during the target or the mask; whichever row has it gets
// pleasant (1 = k, 0 = d) and rt_from_target (ms from target onset)
var target_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => amp_screen(jsPsych.evaluateTimelineVariable('target_file')),
  choices: ['d', 'k'],
  trial_duration: timing.target,
  data: amp_data('target'),
  on_finish: function (data) {
    if (data.response !== null) {
      data.pleasant = data.response === 'k' ? 1 : 0;
      data.rt_from_target = data.rt;
    }
  },
};

var mask_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: amp_screen('./img/ampmask.jpg', 'width:480px; height:480px;'),
  choices: ['d', 'k'],
  trial_duration: null,
  data: amp_data('mask'),
  on_finish: function (data) {
    data.pleasant = data.response === 'k' ? 1 : 0;
    data.rt_from_target = timing.target + data.rt;
  },
};

// mask only runs if there was no response during the target
var mask_if_needed = {
  timeline: [mask_screen],
  conditional_function: () => jsPsych.data.get().last(1).values()[0].response === null,
};

var amp_block = {
  timeline: [fixation, prime_screen, blank_screen, target_screen, mask_if_needed],
  timeline_variables: amp_trials,
};
timeline.push(amp_block);


jsPsych.run(timeline);
