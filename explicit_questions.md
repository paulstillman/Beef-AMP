# Explicit attitude questions

Edit freely. When you're done, Claude will update `exp.js` to match.
The same questions are asked twice: after AMP 1 and after AMP 2.

**How to edit**
- Each question has an **ID** (short name used for the data column, e.g. `explicit_like`), the **wording**, the **scale** (1–7 or 1–9), and the **anchors** (labels shown at the ends, plus a midpoint label if you want one).
- **Group** says whether an item goes in the averaged attitude score (`composite`) or is analyzed on its own (`separate`).
- To add a question, copy a block. To drop one, delete it or mark it `DROP`.
- **Labels:** bipolar items (e.g. negative–positive) label every point with its number and a phrase: Very X · X · Somewhat X · Neither X nor Y · Somewhat Y · Y · Very Y. Unipolar items ("Not at all … Very …") label only the endpoints; points 2–6 show just the number. The **Labels** line under each item is exactly what participants see.
- Questions on the same page appear together. Order within a page is randomized unless you say otherwise.

**Reference: the Kevin measure (Cone et al., 2019, 2021).** Six 7-point items averaged into one score: likeable (very unlikeable–very likeable), bad–good, mean–pleasant, disagreeable–agreeable, uncaring–caring, cruel–kind.

---

## Page 1: beef

**Page text (shown above the questions):** Please answer the following questions about beef.

**Order on this page:** three groups, always in this order: (1) attitude: `like` first, then `good`/`positive` shuffled; (2) ambivalence: `certainty`/`conflicted`/`confident` shuffled; (3) other: `taste`/`healthy`/`env_friendly`/`ethical` shuffled.

### like
- **Wording:** Overall, how much do you like or dislike beef?
- **Scale:** 1–7
- **Anchors:** 1 = Dislike very much · 7 = Like very much
- **Labels:** 1 Dislike very much · 2 Dislike · 3 Somewhat dislike · 4 Neither like nor dislike · 5 Somewhat like · 6 Like · 7 Like very much
- **Group:** composite
- **Position:** always first

### good
- **Wording:** I think beef is...
- **Scale:** 1–7
- **Anchors:** 1 = Very Bad · 7 = Very Good
- **Labels:** 1 Very bad · 2 Bad · 3 Somewhat bad · 4 Neither bad nor good · 5 Somewhat good · 6 Good · 7 Very good
- **Group:** composite

### positive
- **Wording:** My opinion of beef is...
- **Scale:** 1–7
- **Anchors:** 1 = Very Negative · 7 = Very Positive
- **Labels:** 1 Very negative · 2 Negative · 3 Somewhat negative · 4 Neither negative nor positive · 5 Somewhat positive · 6 Positive · 7 Very positive
- **Group:** composite

### certainty
- **Wording:** How certain are you of your attitude towards beef?
- **Scale:** 1–7
- **Anchors:** 1 = Not at all certain · 7 = Very certain
- **Labels:** 1 Not at all certain · 2 · 3 · 4 · 5 · 6 · 7 Very certain
- **Group:** ambivalence

### conflicted
- **Wording:** How conflicted do you feel towards beef?
- **Scale:** 1–7
- **Anchors:** 1 = Not at all conflicted · 7 = Very Conflicted
- **Labels:** 1 Not at all conflicted · 2 · 3 · 4 · 5 · 6 · 7 Very conflicted
- **Group:** ambivalence

### confident
- **Wording:** How confident do you feel in your attitudes towards beef?
- **Scale:** 1–7
- **Anchors:** 1 = Not at all confident · 7 = Very Confident
- **Labels:** 1 Not at all confident · 2 · 3 · 4 · 5 · 6 · 7 Very confident
- **Group:** ambivalence

### taste
- **Wording:** How tasty do you think beef is?
- **Scale:** 1–7
- **Anchors:** 1 = Not at all tasty · 7 = Very tasty
- **Labels:** 1 Not at all tasty · 2 · 3 · 4 · 5 · 6 · 7 Very tasty
- **Group:** separate

### healthy
- **Wording:** How healthy do you think beef is?
- **Scale:** 1–7
- **Anchors:** 1 = Very Unhealthy · 7 = Very Healthy
- **Labels:** 1 Very unhealthy · 2 Unhealthy · 3 Somewhat unhealthy · 4 Neither unhealthy nor healthy · 5 Somewhat healthy · 6 Healthy · 7 Very healthy
- **Group:** separate

### env_friendly
- **Wording:** I think beef is...
- **Scale:** 1–7
- **Anchors:** 1 = Very Environmentally harmful · 7 = Very Environmentally friendly
- **Labels:** 1 Very environmentally harmful · 2 Environmentally harmful · 3 Somewhat environmentally harmful · 4 Neither harmful nor friendly · 5 Somewhat environmentally friendly · 6 Environmentally friendly · 7 Very environmentally friendly
- **Group:** separate

### ethical
- **Wording:** I think beef is...
- **Scale:** 1–7
- **Anchors:** 1 = Very Unethical · 7 = Very Ethical
- **Labels:** 1 Very unethical · 2 Unethical · 3 Somewhat unethical · 4 Neither unethical nor ethical · 5 Somewhat ethical · 6 Ethical · 7 Very ethical
- **Group:** separate (ethical content from the learning phase)

---

## Page 2: chicken and desserts

**Page text:** Please answer the following questions about chicken and desserts.

**Order:** chicken block and dessert block appear in random order; within each block, items are in the order below. Same labels as the matching beef items.

### chicken_like / dessert_like
- **Wording:** Overall, how much do you like or dislike chicken? / ...desserts?
- **Scale:** 1–7 (labels as `like`)
- **Group:** composite (per food)

### chicken_good / dessert_good
- **Wording:** I think chicken is... / I think desserts are...
- **Scale:** 1–7 (labels as `good`)
- **Group:** composite (per food)

### chicken_positive / dessert_positive
- **Wording:** My opinion of chicken is... / My opinion of desserts is...
- **Scale:** 1–7 (labels as `positive`)
- **Group:** composite (per food)

---

## End of study (asked once, after everything else)

### intend_reduce
- **Wording:** How likely are you to eat less beef in the next month?
- **Scale:** 1–7
- **Anchors:** 1 = Very unlikely · 7 = Very likely
- **Labels:** 1 Very unlikely · 2 Unlikely · 3 Somewhat unlikely · 4 Neither unlikely nor likely · 5 Somewhat likely · 6 Likely · 7 Very likely
- **Group:** separate (intention)
- **Position:** first on the end page, before `eat_freq`

### eat_freq
- **Wording:** How often do you eat beef?
- **Scale:** 1–7
- **Labels:** 1 Never · 2 Less than once a month · 3 1–3 times a month · 4 Once a week · 5 2–4 times a week · 6 5–6 times a week · 7 Daily
- **Group:** separate (behavior)

---

## Optional ideas (not in the experiment; move any you want into a page above)

### thermometer
- **Wording:** How warm or cold do you feel toward beef?
- **Scale:** 1–9
- **Anchors:** 1 = Very cold / unfavorable · 5 = Neutral · 9 = Very warm / favorable
- **Group:** composite or separate
- **Note:** a short version of the classic 0–100 feeling thermometer.

