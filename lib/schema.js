// Small helpers so the JSON schemas below stay readable.
// Structured outputs need every property required and no extra properties.
export const str = (description) => ({ type: "string", description });
export const int = (description) => ({ type: "integer", description });
export const list = (items, description) => ({ type: "array", items, description });
export const oneOf = (values, description) => ({ type: "string", enum: values, description });
export const obj = (properties, description) => ({
  type: "object",
  description,
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
