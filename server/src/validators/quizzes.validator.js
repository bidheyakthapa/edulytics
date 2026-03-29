import Joi from "joi";

export const createQuizValidator = Joi.object({
  semester_id: Joi.number().integer().required(),
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().allow("").optional(),
  time_limit_sec: Joi.number().integer().min(60).optional(),
  questions: Joi.array()
    .min(1)
    .items(
      Joi.object({
        topic_id: Joi.number().integer().required(),
        question_text: Joi.string().trim().min(2).required(),
        options: Joi.array()
          .min(2)
          .items(
            Joi.object({
              option_text: Joi.string().trim().min(1).required(),
              is_correct: Joi.boolean().required(),
            }),
          )
          .required(),
      }),
    )
    .required(),
});

export const updateQuizMetaValidator = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().allow("").optional(),
  time_limit_sec: Joi.number().integer().min(60).optional(),
});

export const attemptQuizValidator = Joi.object({
  answers: Joi.array()
    .min(1)
    .items(
      Joi.object({
        question_id: Joi.number().required(),
        selected_option_id: Joi.number().required(),
      }),
    )
    .required(),
});
