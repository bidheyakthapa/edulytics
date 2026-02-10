import Joi from "joi";

export const createTopicValidator = Joi.object({
  semesterId: Joi.number().integer().required().messages({
    "any.required": "semester_id is required",
  }),

  name: Joi.string().trim().min(2).max(120).required().messages({
    "string.empty": "Topic name is required",
    "string.min": "Topic name must be at least 2 characters",
    "string.max": "Topic name must be at most 120 characters",
  }),
});

export const updateTopicValidator = Joi.object({
  name: Joi.string().trim().min(2).max(120).required().messages({
    "string.empty": "Topic name is required",
    "string.min": "Topic name must be at least 2 characters",
    "string.max": "Topic name must be at most 120 characters",
  }),
});
