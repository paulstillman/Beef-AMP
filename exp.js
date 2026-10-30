// add ?nosave to the URL when testing: nothing is sent to DataPipe, there is no
// redirect, and the raw data is shown at the end instead
const NOSAVE = new URLSearchParams(location.search).has('nosave');

/* ---------- lab session router (see AGENTS.md, "Lab router") ---------- */

// The router sends participants here with ?pid=...; at the end we send them back with
// ?from=<SURVEY_ID>&pid=<pid>, like every Qualtrics study does with its own SurveyID.
// SURVEY_ID is our fixed stand-in for a Qualtrics SV_ ID: list this study in the lab sheet as
// https://paulstillman.github.io/Beef-AMP/?study=SV_BeefAMP so the router can recognize it.
const SURVEY_ID = 'SV_BeefAMP';
const ROUTER_URL = 'https://bostonu.qualtrics.com/jfe/form/SV_bPg2NmkSI0V5hwW';

// DataPipe (Google Drive) via the pipe extension. stream: false = no per-trial writes
// during the study (they compete with the 100 ms AMP screens); the full CSV is
// submitted once, when the experiment ends
const jsPsych = initJsPsych({
  extensions: [
    {
      type: jsPsychExtensionPipe,
      params: {
        experiment_id: "4OEY2BEtOzsk",
        filename: () => `${pid}.csv`,
        stream: false,
        enabled: !NOSAVE,
      },
    },
  ],
  // runs after the extension has finished uploading
  on_finish: function () {
    const redirect = `${ROUTER_URL}?from=${SURVEY_ID}&pid=${encodeURIComponent(pid)}`;
    if (NOSAVE) {
      jsPsych.data.displayData();
      // timing check for testing machines: share of AMP trials with a screen off by > 25 ms
      const amp = jsPsych.data.get().filter({ trial_part: 'amp' }).values();
      const off = (v, want) => v !== null && Math.abs(v - want) > 25;
      const bad = amp.filter(r => off(r.prime_ms, timing.prime) || off(r.blank_ms, timing.blank) ||
        off(r.target_ms, timing.target) && r.responded_during === 'mask');
      const worst = amp.length ? Math.round(Math.max(...amp.map(r => Math.max(r.prime_ms, r.blank_ms)))) : 0;
      jsPsych.getDisplayElement().insertAdjacentHTML('afterbegin',
        `<div style="font:18px sans-serif;padding:12px;margin:12px;border:2px solid ${bad.length ? 'red' : 'green'}">
          Timing check: ${bad.length} of ${amp.length} AMP trials had a prime, blank or target off by more than 25 ms
          (longest prime/blank: ${worst} ms; frame interval about ${amp.length ? amp[0].frame_ms.toFixed(1) : '?'} ms).
         </div>`);
      console.log('would redirect to:', redirect);
    } else {
      window.location.href = redirect;
    }
  },
});


// pid comes from the router; if missing, make one with the SG_ (self-generated) prefix
let pid = jsPsych.data.getURLVariable('pid');
const pid_source = pid ? 'url' : 'self_generated';
if (!pid) {
  pid = `SG_${jsPsych.randomization.randomID(12)}`;
}
jsPsych.data.addProperties({ pid: pid, pid_source: pid_source, survey_id: SURVEY_ID });


let timeline = [];


/* ---------- settings ---------- */

// durations in ms, following Kurdi et al. (2023), Exp. 1
const timing = {
  first_fixation: 1000, // first trial of each AMP block (right after the "press space" screen)
  fixation: 500,
  prime: 100,
  blank: 100,
  target: 100,
  // mask stays up until response
};

const n_reps_per_prime = 4; // 5 images x 4 reps = 20 trials per category
const n_targets_available = 200;

// practice (before AMP 1 only): each image once. Sources/licenses in img/practice/CREDITS.md
const practice_images = [
  './img/practice/cutlery_set.jpg',
  './img/practice/plate_spoons.jpg',
  './img/practice/table_setting.jpg',
  './img/practice/plate_set.jpg',
  './img/practice/plate_knife.jpg',
];

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


/* ---------- build trial lists ---------- */

// each target painting is used at most once across all AMP blocks (practice, AMP 1, AMP 2)
const target_pool = jsPsych.randomization.shuffle(
  Array.from({ length: n_targets_available }, (_, i) => i + 1)
);
function take_targets(n) {
  return target_pool.splice(0, n).map(v => `./img/targets_resized/pic${v}.png`);
}

// every prime image repeated n_reps_per_prime times, shuffled together across categories
function main_primes() {
  return jsPsych.randomization.shuffle(
    Object.entries(prime_images).flatMap(([category, files]) =>
      files.flatMap(file =>
        Array(n_reps_per_prime).fill({ prime_category: category, prime_file: file })
      )
    )
  );
}

function make_amp_trials(block_name, primes) {
  const targets = take_targets(primes.length);
  return primes.map((p, i) => ({
    ...p,
    target_file: targets[i],
    amp_block: block_name,
    amp_trial: i + 1,
    fixation_duration: i === 0 ? timing.first_fixation : timing.fixation,
  }));
}

const practice_trials = make_amp_trials('practice', jsPsych.randomization.shuffle(
  practice_images.map(file => ({ prime_category: 'practice', prime_file: file }))
));
const amp1_trials = make_amp_trials('amp1', main_primes());
const amp2_trials = make_amp_trials('amp2', main_primes());


/* ---------- trials ---------- */

var preload = {
  type: jsPsychPreload,
  images: [...practice_trials, ...amp1_trials, ...amp2_trials].map(t => t.target_file)
    .concat(Object.values(prime_images).flat(), practice_images, ['./img/fixation.png', './img/ampmask.jpg']),
};
/* ---------- consent (BU IRB text; formatting lightly edited) ---------- */

var consent = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `<div class="consent">
    <h2>Consent to Participate in Research</h2>

    <h3>Introduction</h3>
    <p>The purpose of this form is to provide you with important information about participation in this
    research study. You may print a copy of this form now, if you would like one for your records.</p>
    <p>The aim of this research is to understand the psychological processes involved in human judgment and
    decision-making. This research is funded by the Questrom School of Business at Boston University. The
    person in charge of this study is Dr. Paul Stillman, Assistant Professor of Marketing. Dr. Stillman can be
    reached at 595 Commonwealth Ave, Room 601, Boston, MA 02215, or by email at pstill@bu.edu. We will refer
    to this person as the &ldquo;researcher&rdquo; throughout this form.</p>
    <p>We are asking you to participate in this study because you are over 18 years of age, fluent in English,
    and can use a computer.</p>
    <p>This research is expected to take about 15 minutes to complete.</p>

    <h3>What will happen if I take part in this research study?</h3>
    <p>If you agree to take part in this study, we may ask you to do the following procedures (online). You may
    complete tasks on the computer related to human judgment and decision-making. You may make some financial
    decisions about bonus money that we give to you in the experiment. We may expose you to pictures, sounds,
    videos, or ask you to imagine/recall experiences. You will not be exposed to stimuli that are more
    disturbing (e.g., anger/sadness/disgust/fear-inducing) than what you might see in an R-rated movie or on
    YouTube. We may ask you about your demographic information, health, or mood.</p>

    <h3>Will I get paid for taking part in this research study?</h3>
    <p>You will earn study credit for participating in the URO pool.</p>

    <h3>If I have any questions or concerns about this research study, whom can I talk to?</h3>
    <p>You can call between 9am and 5pm ET with any concerns or questions. Please contact Dr. Paul Stillman,
    who can be reached via pstill@bu.edu. He can provide you with a copy of this document. If you have
    questions about your rights as a research subject or want to speak with someone independent of the
    research team, you may contact the Boston University IRB directly at 617.358.6115.</p>

    <p class="consent_prompt">If you agree to participate, please click the &ldquo;Next Page&rdquo; button below to proceed.</p>
  </div>`,
  choices: ['Next Page'],
  data: { trial_part: 'consent' },
};
timeline.push(consent);

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

var practice_intro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<div class='instructions'>
    <p>We will now provide you with an opportunity to practice the task.</p>
    <p>Remember: You should judge whether each abstract painting is more or less visually pleasant
    than average by pressing the D or the K key.</p>
    <p>When you are ready to try a few practice responses, press the space bar.</p>
  </div>`,
  choices: [' '],
  data: { trial_part: 'instructions' },
};

var test_ready = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<div class='instructions'>
    <p>Good! The test phase will now begin. Keep going as before.</p>
    <p>As a reminder: If the abstract painting is less visually pleasant than average, press the D key.
    And if it is more visually pleasant than average, press the K key.</p>
    <p>Ready? Press the space bar to begin.</p>
  </div>`,
  choices: [' '],
  data: { trial_part: 'instructions' },
};


// one jsPsych trial per AMP trial (see amp_trial_plugin.js for why); one data row each
var amp_trial = {
  type: jsPsychAmpTrial,
  fixation_image: './img/fixation.png',
  prime_image: jsPsych.timelineVariable('prime_file'),
  target_image: jsPsych.timelineVariable('target_file'),
  mask_image: './img/ampmask.jpg',
  fixation_duration: jsPsych.timelineVariable('fixation_duration'),
  prime_duration: timing.prime,
  blank_duration: timing.blank,
  target_duration: timing.target,
  choices: ['d', 'k'],
  labels: `<div class="text_left_v2">D<br>Less Pleasant</div>
           <div class="text_right_v2">K<br>More Pleasant</div>`,
  data: {
    trial_part: 'amp',
    amp_block: jsPsych.timelineVariable('amp_block'),
    amp_trial: jsPsych.timelineVariable('amp_trial'),
    prime_category: jsPsych.timelineVariable('prime_category'),
    prime_file: jsPsych.timelineVariable('prime_file'),
    target_file: jsPsych.timelineVariable('target_file'),
  },
  on_finish: function (data) {
    data.pleasant = data.response === 'k' ? 1 : 0;
  },
};

function make_amp_block(trials) {
  return {
    timeline: [amp_trial],
    timeline_variables: trials,
  };
}

timeline.push(instructions, practice_intro, make_amp_block(practice_trials),
  test_ready, make_amp_block(amp1_trials));


/* ---------- explicit attitudes (see explicit_questions.md) ---------- */

// Items, scales and labels are defined in explicit_questions.md; keep in sync.
// Bipolar items label every point ("1<br>Very negative" ... "7<br>Very positive").
// Unipolar "not at all ... very" items label only the endpoints; the rest are numbers.
function bipolar_labels(low, high, mid = `Neither ${low}<br>nor ${high}`) {
  const cap = x => x[0].toUpperCase() + x.slice(1);
  return [`Very ${low}`, cap(low), `Somewhat ${low}`, cap(mid),
          `Somewhat ${high}`, cap(high), `Very ${high}`].map((l, i) => `${i + 1}<br>${l}`);
}

function unipolar_labels(low, high) {
  return ['1', '2', '3', '4', '5', '6', '7']
    .map((n, i) => i === 0 ? `1<br>${low}` : i === 6 ? `7<br>${high}` : n);
}

function item(name, prompt, labels) {
  return { name: name, prompt: prompt, labels: labels, required: true };
}

const like_labels = [
  '1<br>Dislike very much', '2<br>Dislike', '3<br>Somewhat dislike',
  '4<br>Neither like<br>nor dislike', '5<br>Somewhat like', '6<br>Like', '7<br>Like very much',
];

// beef page: three groups in fixed order, items shuffled within each group
// ('like' always first in the attitude group)
const beef_attitude = [
  item('good', 'I think beef is...', bipolar_labels('bad', 'good')),
  item('positive', 'My opinion of beef is...', bipolar_labels('negative', 'positive')),
];
const beef_ambivalence = [
  item('certainty', 'How certain are you of your attitude towards beef?',
    unipolar_labels('Not at all certain', 'Very certain')),
  item('conflicted', 'How conflicted do you feel towards beef?',
    unipolar_labels('Not at all conflicted', 'Very conflicted')),
  item('confident', 'How confident do you feel in your attitudes towards beef?',
    unipolar_labels('Not at all confident', 'Very confident')),
];
const beef_other = [
  item('taste', 'How tasty do you think beef is?',
    unipolar_labels('Not at all tasty', 'Very tasty')),
  item('healthy', 'How healthy do you think beef is?', bipolar_labels('unhealthy', 'healthy')),
  item('env_friendly', 'I think beef is...',
    bipolar_labels('environmentally harmful', 'environmentally friendly', 'neither harmful<br>nor friendly')),
  item('ethical', 'I think beef is...', bipolar_labels('unethical', 'ethical')),
];
const shuffle = jsPsych.randomization.shuffle;

// same three composite items for the comparison foods (columns explicit_chicken_like, ...)
function comparison_items(key, noun, verb) {
  return [
    item(`${key}_like`, `Overall, how much do you like or dislike ${noun}?`, like_labels),
    item(`${key}_good`, `I think ${noun} ${verb}...`, bipolar_labels('bad', 'good')),
    item(`${key}_positive`, `My opinion of ${noun} is...`, bipolar_labels('negative', 'positive')),
  ];
}

// responses come back 0-6; save each as 1-7 in its own column
function save_likert(shown) {
  return function (data) {
    Object.entries(data.response).forEach(([k, v]) => { data[`explicit_${k}`] = v + 1; });
    data.explicit_order = shown().map(q => q.name).join(',');
  };
}

// both pages, built once per time point ('t1' after AMP 1, 't2' after AMP 2);
// every row gets explicit_time so the two rounds can be told apart
function make_explicit(time) {
  let beef_shown = [];
  const beef = {
    type: jsPsychSurveyLikert,
    preamble: '<p>Please answer the following questions about beef.</p>',
    questions: () => {
      beef_shown = [
        item('like', 'Overall, how much do you like or dislike beef?', like_labels),
        ...shuffle(beef_attitude), ...shuffle(beef_ambivalence), ...shuffle(beef_other),
      ];
      return beef_shown;
    },
    scale_width: 900,
    data: { trial_part: 'explicit', explicit_time: time, explicit_page: 'beef' },
    on_finish: save_likert(() => beef_shown),
  };

  // page 2, chicken and desserts: food order randomized, items in fixed order within each food
  let comparison_shown = [];
  const comparison = {
    type: jsPsychSurveyLikert,
    preamble: '<p>Please answer the following questions about chicken and desserts.</p>',
    questions: () => {
      comparison_shown = jsPsych.randomization.shuffle([
        comparison_items('chicken', 'chicken', 'is'),
        comparison_items('dessert', 'desserts', 'are'),
      ]).flat();
      return comparison_shown;
    },
    scale_width: 900,
    data: { trial_part: 'explicit', explicit_time: time, explicit_page: 'comparison' },
    on_finish: save_likert(() => comparison_shown),
  };

  return [beef, comparison];
}

timeline.push(...make_explicit('t1'));


/* ---------- learning phase (statements: learning_statements.md -> learning_items.js) ---------- */

// Kevin-style learning (Cone et al., 2019, 2021): each statement is shown under a photo of
// beef; A = accurate, I = inaccurate; feedback says correct/incorrect plus the source.
// Each beef AMP prime is used equally often (5 images x 6 = 30), randomly paired with statements.
const learning_trials = (() => {
  const reps = Math.ceil(learning_items.length / prime_images.beef.length);
  const imgs = jsPsych.randomization.shuffle(
    prime_images.beef.flatMap(file => Array(reps).fill(file))
  );
  return jsPsych.randomization.shuffle(learning_items).map((it, i) => ({
    ...it,
    image: imgs[i],
    learning_trial: i + 1,
  }));
})();

function learning_screen(image, statement, below) {
  return `
    <div class="learning_container">
      <img src="${image}" class="learning_img">
      <p class="learning_statement">${statement}</p>
      <div class="learning_below">${below}</div>
    </div>`;
}

const learning_keys = `
  <div class="learning_keys">
    <span>A<br>Accurate</span>
    <span>I<br>Inaccurate</span>
  </div>`;

var learning_intro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<div class='instructions'>
    <p>In the next part of the study, you will read a series of statements about beef.
    Some of the statements are accurate and some are inaccurate.</p>
    <p>For each statement, press the <b>A</b> key if you think it is <b>accurate</b>,
    or the <b>I</b> key if you think it is <b>inaccurate</b>.</p>
    <p>After each answer, you will find out whether you were correct.</p>
    <p>Press the space bar to begin.</p>
  </div>`,
  choices: [' '],
  data: { trial_part: 'instructions' },
};

function learning_data(trial_part) {
  return {
    trial_part: trial_part,
    learning_trial: jsPsych.timelineVariable('learning_trial'),
    learning_item: jsPsych.timelineVariable('item'),
    learning_domain: jsPsych.timelineVariable('domain'),
    learning_accurate: jsPsych.timelineVariable('accurate'),
    learning_image: jsPsych.timelineVariable('image'),
  };
}

var learning_statement = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => learning_screen(
    jsPsych.evaluateTimelineVariable('image'),
    jsPsych.evaluateTimelineVariable('statement'),
    learning_keys),
  choices: ['a', 'i'],
  data: learning_data('learning'),
  on_finish: function (data) {
    data.said_accurate = data.response === 'a';
    data.learning_correct = data.said_accurate === data.learning_accurate;
  },
};

var learning_feedback = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    const correct = jsPsych.data.get().last(1).values()[0].learning_correct;
    const accurate = jsPsych.evaluateTimelineVariable('accurate');
    return learning_screen(
      jsPsych.evaluateTimelineVariable('image'),
      jsPsych.evaluateTimelineVariable('statement'),
      `<p class="learning_verdict" style="color:${correct ? 'blue' : 'red'};">${correct ? 'Correct' : 'Incorrect'}</p>
       <p>This statement is ${accurate ? 'accurate' : 'inaccurate'}.</p>
       <p class="learning_source">Source: ${jsPsych.evaluateTimelineVariable('source')}</p>
       <p class="learning_continue">Press the space bar to continue.</p>`);
  },
  choices: [' '],
  data: learning_data('learning_feedback'),
};

timeline.push(learning_intro, {
  timeline: [learning_statement, learning_feedback],
  timeline_variables: learning_trials,
});


/* ---------- AMP 2 and explicit attitudes, Time 2 ---------- */

// no practice the second time; brief reminder of the AMP instructions
var amp2_intro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<div class='instructions'>
    <p>You will now do the picture task from earlier one more time.</p>
    <p>As before, you will see a real-life image followed by an abstract painting.
    The first image is simply a warning signal and should be ignored.
    Your task is to judge how visually pleasant each abstract painting is.</p>
    <p>If the abstract painting is less visually pleasant than average, press the <b>D</b> key.
    If it is more visually pleasant than average, press the <b>K</b> key.</p>
    <p>Please try your absolute best not to let the real-life images bias your judgment of the abstract paintings.</p>
    <p>Ready? Press the space bar to begin.</p>
  </div>`,
  choices: [' '],
  data: { trial_part: 'instructions' },
};

timeline.push(amp2_intro, make_amp_block(amp2_trials), ...make_explicit('t2'));


/* ---------- end of study (asked once) ---------- */

var end_questions = {
  type: jsPsychSurveyLikert,
  questions: [
    item('beef_plan', 'Over the next month, I plan to eat...', [
      '1<br>Much less beef', '2<br>Less beef', '3<br>Somewhat less beef', '4<br>The same amount<br>of beef',
      '5<br>Somewhat more beef', '6<br>More beef', '7<br>Much more beef',
    ]),
    item('eat_freq', 'How often do you eat beef?', [
      '1<br>Never', '2<br>Less than once a month', '3<br>1&ndash;3 times a month', '4<br>Once a week',
      '5<br>2&ndash;4 times a week', '6<br>5&ndash;6 times a week', '7<br>Daily',
    ]),
    item('hunger', 'How hungry are you right now?',
      unipolar_labels('Not at all hungry', 'Extremely hungry')),
  ],
  scale_width: 900,
  data: { trial_part: 'end_questions' },
  on_finish: function (data) {
    Object.entries(data.response).forEach(([k, v]) => { data[k] = v + 1; });
  },
};

const restriction_options = [
  'No, nothing keeps me from eating beef',
  'Religious reasons',
  'I am vegetarian or vegan',
  'Medical or health reasons (e.g., an allergy or doctor\'s advice)',
  'Ethical or environmental reasons',
  'Other',
];
var beef_restriction = {
  type: jsPsychSurveyMultiSelect,
  questions: [{
    name: 'beef_restriction',
    prompt: 'Is there anything that keeps you from eating beef (for example, religious, dietary, or medical reasons)? Select all that apply.',
    options: restriction_options,
    required: true,
  }],
  data: { trial_part: 'end_questions' },
  on_finish: function (data) {
    const chosen = data.response.beef_restriction;
    data.beef_restriction = chosen.join('; ');
    data.beef_restricted = chosen.some(c => c !== restriction_options[0]) ? 1 : 0;
  },
};
timeline.push(end_questions, beef_restriction);


jsPsych.run(timeline);
