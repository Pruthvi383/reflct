const jwt = require("jsonwebtoken");
const { User } = require("../config/db");

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required", statusCode: 401 });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.userId, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(401).json({ message: "Invalid token", statusCode: 401 });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token", statusCode: 401 });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden", statusCode: 403 });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
