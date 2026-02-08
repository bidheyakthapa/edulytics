import Joi from "joi";

export const registerValidator = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .messages({
      "string.pattern.base": "Name must contain only alphabets.",
      "string.empty": "Name is required",
    }),

  email: Joi.string().trim().email().required(),

  password: Joi.string().min(6).required(),

  role: Joi.string().valid("STUDENT", "TEACHER").required().messages({
    "any.only": "Role must be STUDENT or TEACHER",
  }),

  // ---- student-only fields ----
  semester_id: Joi.when("role", {
    is: "STUDENT",
    then: Joi.number().integer().required(),
    otherwise: Joi.forbidden(),
  }),

  frontend_level: Joi.when("role", {
    is: "STUDENT",
    then: Joi.number().integer().min(0).max(5).required(),
    otherwise: Joi.forbidden(),
  }),

  backend_level: Joi.when("role", {
    is: "STUDENT",
    then: Joi.number().integer().min(0).max(5).required(),
    otherwise: Joi.forbidden(),
  }),

  mobile_level: Joi.when("role", {
    is: "STUDENT",
    then: Joi.number().integer().min(0).max(5).optional(),
    otherwise: Joi.forbidden(),
  }),

  uiux_level: Joi.when("role", {
    is: "STUDENT",
    then: Joi.number().integer().min(0).max(5).optional(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginValidator = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
});
