export function createEmptyQuestion() {
  return {
    topic_id: "",
    question_text: "",
    options: [
      { option_text: "", is_correct: true },
      { option_text: "", is_correct: false },
    ],
  };
}
