
const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
    // console.log(jsPsych.data.get().csv());
  },
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




let timeline = [];
/*
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
*/

var preload = {
  type: jsPsychPreload,
  auto_preload: true
}
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


/* 
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
*/

num_array = Array.from(Array(200).keys()).map(v=> v+1)
target_nums = jsPsych.randomization.sampleWithoutReplacement(num_array, 12)

const prime_list = [
  { stimulus: './img/burgers/2patties_solo.jpeg', prime: './img/targets/pic1.png', stim_type: 'beef_burger_1' },
  { stimulus: './img/burgers/double-burger.jpeg', stim_type: 'beef_burger_2' },
  { stimulus: './img/burgers/thickburger.jpeg', stim_type: 'beef_burger_3'},
  { stimulus: './img/steaks/steak_1.jpeg', stim_type: 'beef_steak_1' },
  { stimulus: './img/steaks/steak_3.jpeg', stim_type: 'beef_steak_2' },
  { stimulus: './img/steaks/steak_8.jpeg', stim_type: 'beef_steak_3'}
];
console.log(prime_list)
const target_list = [
  { stimulus: './img/targets/pic1.png', stim_type: 'target_1' },
  { stimulus: './img/targets/pic2.png', stim_type: 'target_2' },
  { stimulus: './img/targets/pic3.png', stim_type: 'target_3'},
  { stimulus: './img/targets/pic4.png', stim_type: 'target_4' },
  { stimulus: './img/targets/pic5.png', stim_type: 'target_5' },
  { stimulus: './img/targets/pic6.png', stim_type: 'target_6'}
];

console.log(prime_list)

var press_to_start = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:32px;">Press any key to start</div>',
  choices: "ALL_KEYS",
  trial_duration: null,
};

timeline.push(press_to_start)

var fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS",
  trial_duration: 250,
};
let index = 0;

var prime_screen = {
  type: jsPsychImageKeyboardResponse,
  stimulus: function() {
    console.log(index)
    stim_to_present = prime_list[index].stimulus
    console.log(stim_to_present)
    index += 1
    return(stim_to_present)
  },
  stimulus_width: 300,
  choices: "NO_KEYS",
  trial_duration: 150, 
  data: {
    stim_type: prime_list[index].stim_type
  }
}
var target_screen = {
  type: jsPsychImageKeyboardResponse,
  stimulus: function() {
    return(`./img/targets/pic${target_nums[index]}.png`)
  },
  stimulus_width: 300,
  choices: "NO_KEYS",
  trial_duration: 150, 
  data: {
    stim_type: prime_list[index].stim_type
  }
}


var loop_node = {
  timeline: [fixation, prime_screen, target_screen],
  loop_function: function(){
    console.log(index)
      if(index < 6){
          return true;
      } else {
          return false;
      }
  }
}
timeline.push(loop_node)

/*
var test_procedure = {
  timeline: [fixation, prime_screen],
  randomize_order: true,
  timelineVariable: { stimulus: 1 },
  sample: {
    type: 'fixed-repetitions',
    size: 6
  }
}
timeline.push(test_procedure)
*/

/*
var leave_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
  message: "You will now leave full screen"
}

timeline.push(leave_fullscreen)
*/
/*
const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "v2ui0QxWeayJ",
  filename: fname,
  data_string: () => jsPsych.data.get().csv()
};
timeline.push(save_data);
*/

jsPsych.run(timeline);

