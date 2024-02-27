
const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
    // console.log(jsPsych.data.get().csv());
  },
  extensions: [
    { type: jsPsychExtensionMouseTracking, params: { minimum_sample_time: 0, events: ['mousemove', 'mouseleave'] } }
  ]
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}


let sub_id = jsPsych.data.getURLVariable('workerId');
if (sub_id === undefined) {
  sub_id = jsPsych.randomization.randomID(10);
}
jsPsych.data.addProperties({ subject_id: sub_id });
const fname = `${sub_id}.csv`;
console.log(fname)


let kface = jsPsych.data.getURLVariable('kface');
let fface = jsPsych.data.getURLVariable('fface');
let sface = jsPsych.data.getURLVariable('sface');
if (kface === undefined) {
  let face_array = [1,2,3,4,5]
  shuffleArray(face_array)
  kface = face_array[0];
  fface = face_array[1];
  sface = face_array[2];
}
kface = '<img src="./img/target_victim/Target' + kface + '.png">'
fface = '<img src="./img/target_victim/Target' + fface + '.png">'
sface = '<img src="./img/target_victim/Target' + sface + '.png">'

console.log(kface)
console.log(fface)
console.log(sface)


let timeline = [];

var preload = {
  type: jsPsychPreload,
  images: ['./img/bad/bloodknife1.jpg',
    './img/bad/caraccident2.jpg',
    './img/bad/feces2.jpg',
    './img/bad/fire9.jpg',
    './img/bad/planecrash2.jpg',
    './img/bad/shot3.jpg',
    './img/good/Dog6.jpg',
    './img/good/Cat5.jpg',
    './img/good/flowers2.jpg',
    './img/good/flowers6.jpg',
    './img/good/Lake12.jpg',
    './img/good/Rainbow2.jpg',
    './img/good/Lake2.jpg',
    './img/target_victim/Target1.png',
    './img/target_victim/Target2.png',
    './img/target_victim/Target3.png',
    './img/target_victim/Target4.png',
    './img/target_victim/Target5.png']
};



timeline.push(preload)

const good_right = Math.floor(Math.random() * 2);
if (good_right === 1) {
  choices_goodbad = ['BAD', 'GOOD'];
} else {
  choices_goodbad = ['GOOD', 'BAD'];
}


var enter_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: "You will now enter full screen, please do not exit full screen until the end of the experiment."
}

// timeline.push(enter_fullscreen)


/* instructions */
var instr_page1 = `<div class='instructions'>

<p>For the next part of the study, we are interested in your evaluations of different things, 
including the people you got to know in the previous part of the experiment.</p>

<p>You will be presented with many different pictures, and asked to evaluate whether you believe 
the person or image depicted in the picture is "GOOD" or "BAD"</p></div>`; 

var instr_page2 = `<div class='instructions'>

<p>For each evaluation, there will be a button that says "START". Pressing the start button will 
make the image appear. After it appears, select either GOOD or BAD.</p>

<p>Please start moving your mouse as soon as the picture appears 
(do not wait until you have made a decision to start moving your mouse).</p>

<p>Please also do not move your mouse outside of the browser window 
(since you are in full screen mode, this should be unlikely).</p>

<p>Try to make your evaluations quickly and accurately. </p> 

<p>On the next slide, you will do a practice trial</p> 

</div>`; 


// combine pages into blocks
instr_block1 = {
    type: jsPsychInstructions,
    pages: [instr_page1, instr_page2],
    show_clickable_nav: true,
};

timeline.push(instr_block1)

const start_screen_practice = {
  type: jsPsychHtmlButtonResponsePES,
  stimulus: `Practice Trial: Press the START button below to begin`,
  choices: ['START'],
  data: {
    task: 'start'
  },
  button_html: '<button class="jspsych-btn" style = "position:absolute; bottom: 0px; left: 50%; transform:translate(-50%); font-weight: bold">%choice%</button>',
};

const mt_trial_practice = {
  type: jsPsychHtmlButtonResponsePES,
  stimulus: '<img src="./img/good/flowers6.jpg">',
  choices: choices_goodbad,
  adjust_aspect_ratio: 0,
  button_html: ['<button class="jspsych-btn mt-response-btn" id="left_response" style = "position:absolute; left: 0px; top: 0px">%choice%</button>', '<button class="jspsych-btn mt-response-btn" id="right_response" style = "position:absolute; right:0px; top: 0px">%choice%</button>'],
  slowmouse_message: `Please begin moving your mouse<br>as soon as the image appears`,
  mouseout_message: `Please keep your mouse<br>in the browser window`,
  data: {
    task: 'MT_practice',
    good_right: good_right,
    stim_type:  'practice'
  },
  extensions: [
    { type: jsPsychExtensionMouseTracking }
  ]
};
timeline.push(start_screen_practice)
timeline.push(mt_trial_practice)


var instr_page3 = `<div class='instructions'>

<p>You will now do the evaluation task. In total, you will do 24 evaluations. Some items may be repeated.</p>

<p>Again, please start moving your mouse as soon as the picture appears, 
and don't move your mouse outside of the browser window.</p>

<p> After the evaluation task, you will be redirected to the last part of the study.</p>

<p>Press next to begin the evaluation task</p></div>`; 
instr_block2 = {
  type: jsPsychInstructions,
  pages: [instr_page3],
  show_clickable_nav: true,
};

timeline.push(instr_block2)


const target_list = [
  { stimulus: kface, stim_type: 'kevin' },
  { stimulus: kface, stim_type: 'kevin' },
  { stimulus: kface, stim_type: 'kevin' },
  { stimulus: kface, stim_type: 'kevin' },
  { stimulus: fface, stim_type: 'francis'  },
  { stimulus: fface, stim_type: 'francis'  },
  { stimulus: fface, stim_type: 'francis'  },
  { stimulus: fface, stim_type: 'francis'  },
  { stimulus: sface, stim_type: 'scott'  },
  { stimulus: sface, stim_type: 'scott'  },
  { stimulus: sface, stim_type: 'scott'  },
  { stimulus: sface, stim_type: 'scott'  },
  { stimulus: '<img src="./img/good/Cat5.jpg">', stim_type: 'positive' },
  { stimulus: '<img src="./img/good/Lake12.jpg">', stim_type: 'positive' },
  { stimulus: '<img src="./img/good/Rainbow2.jpg">', stim_type: 'positive' },
  { stimulus: '<img src="./img/good/flowers2.jpg">', stim_type: 'positive' },
  { stimulus: '<img src="./img/good/Lake2.jpg">', stim_type: 'positive' },
  { stimulus: '<img src="./img/good/Dog6.jpg">', stim_type: 'positive' },
  { stimulus: '<img src="./img/bad/bloodknife1.jpg">', stim_type: 'negative' },
  { stimulus: '<img src="./img/bad/caraccident2.jpg">', stim_type: 'negative' },
  { stimulus: '<img src="./img/bad/feces2.jpg">', stim_type: 'negative' },
  { stimulus: '<img src="./img/bad/fire9.jpg">', stim_type: 'negative' },
  { stimulus: '<img src="./img/bad/planecrash2.jpg">', stim_type: 'negative' },
  { stimulus: '<img src="./img/bad/shot3.jpg">', stim_type: 'negative' }
];


const mt_trial_competent = {
  type: jsPsychHtmlButtonResponsePES,
  // stimulus: '<img src="./img/' + jsPsych.timelineVariable('stimulus') + '.png">',
  stimulus: jsPsych.timelineVariable('stimulus'),
  choices: choices_goodbad,
  adjust_aspect_ratio: 0,
  button_html: ['<button class="jspsych-btn mt-response-btn" id="left_response" style = "position:absolute; left: 0px; top: 0px">%choice%</button>', '<button class="jspsych-btn mt-response-btn" id="right_response" style = "position:absolute; right:0px; top: 0px">%choice%</button>'],
  slowmouse_message: `Please begin moving your mouse<br>as soon as the image appears`,
  mouseout_message: `Please keep your mouse<br>in the browser window`,
  data: {
    task: 'MT',
    good_right: good_right,
    stim_type:  jsPsych.timelineVariable('stim_type')
  },
  extensions: [
    { type: jsPsychExtensionMouseTracking }
  ]
};


const start_screen = {
  type: jsPsychHtmlButtonResponsePES,
  stimulus: ``,
  choices: ['START'],
  data: {
    task: 'start'
  },
  button_html: '<button class="jspsych-btn" style = "position:absolute; bottom: 0px; left: 50%; transform:translate(-50%); font-weight: bold">%choice%</button>',
};

var test_procedure = {
  timeline: [start_screen, mt_trial_competent],
  timeline_variables: target_list,
  randomize_order: true
}

timeline.push(test_procedure)

// timeline.push(start_screen)
// timeline.push(button_test)
// timeline.push(start_screen)
// timeline.push(button_test)

/*
const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <p>In this experiment, a circle will appear in the center 
      of the screen.</p><p>If the circle is <strong>blue</strong>, 
      press the letter F on the keyboard as fast as you can.</p>
      <p>If the circle is <strong>orange</strong>, press the letter J 
      as fast as you can.</p>
      <div style='width: 700px;'>
      <div style='float: left;'><img src='img/blue.png'></img>
      <p class='small'><strong>Press the F key</strong></p></div>
      <div style='float: right;'><img src='img/orange.png'></img>
      <p class='small'><strong>Press the J key</strong></p></div>
      </div>
      <p>Press any key to begin.</p>
    `,
    post_trial_gap: 2000
  };
  
  timeline.push(instructions);

var test_stimuli = [
    { stimulus: "img/blue.png", correct_response: 'f'},
    { stimulus: "img/orange.png", correct_response: 'j'}
  ];
  


  var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: "NO_KEYS",
    trial_duration: function(){
      return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
    },
    data: {
      task: 'fixation'
    }
  }
  
  
var test = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: ['f', 'j'],
    data: {
      task: 'response',
      correct_response: jsPsych.timelineVariable('correct_response')
    },
    on_finish: function(data){
      data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
    }
  }
  
var test_procedure = {
    timeline: [fixation, test],
    timeline_variables: test_stimuli,
    randomize_order: true,
    repetitions: 5
  };
  


timeline.push(test_procedure);

var debrief_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {

    var trials = jsPsych.data.get().filter({task: 'response'});
    var correct_trials = trials.filter({correct: true});
    var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    var rt = Math.round(correct_trials.select('rt').mean());

    return `<p>You responded correctly on ${accuracy}% of the trials.</p>
      <p>Your average response time was ${rt}ms.</p>
      <p>Press any key to complete the experiment. Thank you!</p>`;

  }
};
timeline.push(debrief_block);
*/

var leave_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
  message: "You will now leave full screen"
}

timeline.push(leave_fullscreen)


const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "v2ui0QxWeayJ",
  filename: fname,
  data_string: () => jsPsych.data.get().csv()
};
timeline.push(save_data);


jsPsych.run(timeline);

// console.log(jsPsych.data.get().csv());

