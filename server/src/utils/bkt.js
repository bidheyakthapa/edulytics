export function updateKnowledge(p_know, params, isCorrect) {
  const p_t = parseFloat(params.p_t);
  const p_s = parseFloat(params.p_s);
  const p_g = parseFloat(params.p_g);

  let p_after_answer;

  if (isCorrect) {
    const numerator = p_know * (1 - p_s);
    const denominator = p_know * (1 - p_s) + (1 - p_know) * p_g;
    p_after_answer = numerator / denominator;
  } else {
    const numerator = p_know * p_s;
    const denominator = p_know * p_s + (1 - p_know) * (1 - p_g);
    p_after_answer = numerator / denominator;
  }

  const new_p_know = p_after_answer + (1 - p_after_answer) * p_t;

  return new_p_know;
}
