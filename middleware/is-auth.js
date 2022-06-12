const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Authorization:Bearer dkajhkdhauwhdiuhawi
  const authHeader = req.get("Authorization"); //check for Authorization field on the header
  if (!authHeader) {
    req.isAuth = false;
    return next(); //return keyword is used to avoid executing the upcoming code by using next() method
  }
  const token = authHeader.split(" ")[1]; //Bearer dkajhkdhauwhdiuhawi (splits the bearer and the token)
  if (!token) {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "thisisthesecretkeythatiamgoingtouse"); //decode the token
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true; //assign isAuth to true
  req.userId = decodedToken.userId; //assign userId value from the userId available under the token object
  next();
};
