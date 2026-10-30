// One AMP trial as a single jsPsych trial: fixation -> prime -> blank -> target -> mask.
//
// Why not one jsPsych trial per screen: with 100 ms screens, anything that runs between
// trials (building the next screen, decoding its image, and especially the DataPipe
// extension streaming each finished trial) can delay the next paint, so a prime or target
// is shown far too briefly or not at all. Here all images are in the page and decoded
// before the trial starts, screens are switched by toggling visibility on animation
// frames, and nothing else runs until the response. Each row records the measured
// on-screen duration of every screen.
//
// Keys are accepted from target onset. A response during the target ends the trial
// (no mask); otherwise the mask stays up until the response.

var jsPsychAmpTrial = (function (jspsych) {
  const T = jspsych.ParameterType;

  const info = {
    name: 'amp-trial',
    version: '1.0.0',
    parameters: {
      fixation_image: { type: T.IMAGE, default: undefined },
      prime_image: { type: T.IMAGE, default: undefined },
      target_image: { type: T.IMAGE, default: undefined },
      mask_image: { type: T.IMAGE, default: undefined },
      fixation_duration: { type: T.INT, default: 500 },
      prime_duration: { type: T.INT, default: 100 },
      blank_duration: { type: T.INT, default: 100 },
      target_duration: { type: T.INT, default: 100 },
      choices: { type: T.KEYS, default: ['d', 'k'] },
      // HTML shown on every screen (the D/K labels)
      labels: { type: T.HTML_STRING, default: '' },
    },
    data: {
      response: { type: T.STRING },
      rt: { type: T.INT },
      responded_during: { type: T.STRING },
      fixation_ms: { type: T.FLOAT },
      prime_ms: { type: T.FLOAT },
      blank_ms: { type: T.FLOAT },
      target_ms: { type: T.FLOAT },
      frame_ms: { type: T.FLOAT },
    },
  };

  class AmpTrialPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      const layers = ['fixation', 'prime', 'target', 'mask'];
      display_element.innerHTML = `
        <div class="container_amp_v2">
          <div class="amp_stage">
            ${layers.map(l => `<img class="amp_layer ${l === 'mask' ? 'amp_mask' : ''}"
              data-layer="${l}" src="${trial[l + '_image']}">`).join('')}
          </div>
          ${trial.labels}
        </div>`;
      const img = {};
      display_element.querySelectorAll('.amp_layer').forEach(el => { img[el.dataset.layer] = el; });
      const show = (layer) => layers.forEach(l => { img[l].style.visibility = l === layer ? 'visible' : 'hidden'; });
      show(null);

      const phases = [
        ['fixation', 'fixation', trial.fixation_duration],
        ['prime', 'prime', trial.prime_duration],
        ['blank', null, trial.blank_duration],
        ['target', 'target', trial.target_duration],
        ['mask', 'mask', null],
      ];
      const onset = {};
      const deltas = [];
      let phase = -1;
      let last_frame = null;
      let raf = null;
      let done = false;
      let listener = null;
      let listener_start = null;

      const frame_ms = () => {
        if (deltas.length === 0) return 1000 / 60;
        const s = [...deltas].sort((a, b) => a - b);
        return s[Math.floor(s.length / 2)];
      };

      const finish = (response, rt_from_target) => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        if (listener) this.jsPsych.pluginAPI.cancelKeyboardResponse(listener);
        const end = performance.now();
        const dur = (a, b) => (onset[a] !== undefined ? (onset[b] ?? end) - onset[a] : null);
        this.jsPsych.finishTrial({
          response: response,
          rt: rt_from_target,
          responded_during: onset.mask !== undefined ? 'mask' : 'target',
          fixation_ms: dur('fixation', 'prime'),
          prime_ms: dur('prime', 'blank'),
          blank_ms: dur('blank', 'target'),
          target_ms: dur('target', 'mask'),
          frame_ms: frame_ms(),
        });
      };

      const after_response = (info) => {
        // info.rt is from when the listener started; convert to ms from target onset
        finish(info.key, info.rt + (listener_start - onset.target));
      };

      // Uses the real time when each frame's callback runs, not the frame timestamp rAF
      // passes in: after a long main-thread block that timestamp can be stale, which would
      // make a screen look older than it is and cut it to a single frame.
      const tick = () => {
        if (done) return;
        const t = performance.now();
        if (last_frame !== null) deltas.push(t - last_frame);
        last_frame = t;
        // advance when the current screen has been up for its duration (within half a frame)
        const due = phase < 0 ||
          (phases[phase][2] !== null && t - onset[phases[phase][0]] >= phases[phase][2] - frame_ms() / 2);
        if (due && phase < phases.length - 1) {
          phase += 1;
          const [name, layer] = phases[phase];
          show(layer);
          onset[name] = t;
          if (name === 'target') {
            listener_start = performance.now();
            listener = this.jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: after_response,
              valid_responses: trial.choices,
              rt_method: 'performance',
              persist: false,
              allow_held_key: false,
            });
          }
        }
        raf = requestAnimationFrame(tick);
      };

      // start only once every image is decoded, so no screen waits on decoding
      Promise.all(layers.map(l => img[l].decode().catch(() => {}))).then(() => {
        raf = requestAnimationFrame(tick);
      });
    }
  }

  AmpTrialPlugin.info = info;
  return AmpTrialPlugin;
})(jsPsychModule);
