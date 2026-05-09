export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export function validateUser(values, includeRole = false) {
  const errors = {};
  if (!values.name || values.name.length < 20 || values.name.length > 60) errors.name = "Name must be 20-60 characters.";
  if (!emailRegex.test(values.email || "")) errors.email = "Enter a valid email address.";
  if (!values.address || values.address.length > 400) errors.address = "Address is required and must be under 400 characters.";
  if (!passwordRegex.test(values.password || "")) errors.password = "Password must be 8-16 chars with uppercase and special character.";
  if (includeRole && !["admin", "user", "store_owner"].includes(values.role)) errors.role = "Select a valid role.";
  return errors;
}

export function validateStore(values) {
  const errors = {};
  if (!values.name || values.name.length < 20 || values.name.length > 60) errors.name = "Name must be 20-60 characters.";
  if (!emailRegex.test(values.email || "")) errors.email = "Enter a valid email address.";
  if (!values.address || values.address.length > 400) errors.address = "Address is required and must be under 400 characters.";
  if (!values.owner_id) errors.owner_id = "Owner is required.";
  return errors;
}

export function validatePassword(values) {
  const errors = {};
  if (!values.currentPassword) errors.currentPassword = "Current password is required.";
  if (!passwordRegex.test(values.newPassword || "")) errors.newPassword = "Password must be 8-16 chars with uppercase and special character.";
  return errors;
}
