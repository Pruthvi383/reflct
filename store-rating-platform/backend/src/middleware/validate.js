const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const ROLES = ["admin", "user", "store_owner"];

function validateFields(body, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} is required`);
      continue;
    }
    if (value === undefined || value === null || value === "") continue;
    if (rules.type === "string" && typeof value !== "string") errors.push(`${field} must be a string`);
    if (rules.min && String(value).length < rules.min) errors.push(`${field} must be at least ${rules.min} characters`);
    if (rules.max && String(value).length > rules.max) errors.push(`${field} must be at most ${rules.max} characters`);
    if (rules.email && !EMAIL_REGEX.test(String(value))) errors.push(`${field} must be a valid email`);
    if (rules.password && !PASSWORD_REGEX.test(String(value))) {
      errors.push(`${field} must be 8-16 chars with one uppercase and one special character`);
    }
    if (rules.role && !ROLES.includes(value)) errors.push("role is invalid");
    if (rules.rating && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 5)) {
      errors.push("rating must be an integer between 1 and 5");
    }
  }

  return errors;
}

function validate(schema) {
  return (req, res, next) => {
    const errors = validateFields(req.body, schema);
    if (errors.length) return res.status(400).json({ message: errors.join(", "), statusCode: 400 });
    next();
  };
}

const schemas = {
  register: {
    name: { required: true, type: "string", min: 20, max: 60 },
    email: { required: true, type: "string", email: true },
    address: { required: true, type: "string", max: 400 },
    password: { required: true, type: "string", password: true }
  },
  login: {
    email: { required: true, type: "string", email: true },
    password: { required: true, type: "string" }
  },
  changePassword: {
    currentPassword: { required: true, type: "string" },
    newPassword: { required: true, type: "string", password: true }
  },
  adminUser: {
    name: { required: true, type: "string", min: 20, max: 60 },
    email: { required: true, type: "string", email: true },
    address: { required: true, type: "string", max: 400 },
    password: { required: true, type: "string", password: true },
    role: { required: true, role: true }
  },
  store: {
    name: { required: true, type: "string", min: 20, max: 60 },
    email: { required: true, type: "string", email: true },
    address: { required: true, type: "string", max: 400 },
    owner_id: { required: true }
  },
  rating: {
    store_id: { required: true },
    rating: { required: true, rating: true }
  }
};

module.exports = { validate, schemas, validateFields };
