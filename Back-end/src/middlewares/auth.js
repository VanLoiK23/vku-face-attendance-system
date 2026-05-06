require("dotenv").config();

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const white_list = ["/", "/register", "/login"];

  if (white_list.includes(req.path)) {
    console.log(req.path);
    next();
  } else {
    console.log("token "+req?.headers?.authorization?.split(" ")?.[1])
    if (req?.headers?.authorization?.split(" ")?.[1]) {
      const token = req.headers.authorization.split(" ")[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        };

        console.log("Token " + token);
        console.log("decode " + decoded);
        next();
      } catch (error) {
        return res.status(401).json({
          message: "Token is expired or non valid",
        });
      }
    } else {
      return res.status(401).json({
        message: "You didn't pass access token/Your token is expired",
      });
    }
  }
};

const authIsAdmin = (req, res, next) => {
    // if (req.user.role !== "admin") {
    //     return res.status(403).json({ message: "Forbidden" });
    // }
    next();
};

module.exports = { auth, authIsAdmin };
