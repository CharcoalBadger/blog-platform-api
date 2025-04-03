const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // No token, unauthorized
  }

  // Log the token for debugging
  console.log("Received Token:", token);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.sendStatus(403); // Invalid token
    }

    req.user = user; // Attach user to request object
    console.log("Authenticated User:", user); // Log the authenticated user
    next(); // Move on to the next middleware or route handler
  });
};

module.exports = authenticateToken;
