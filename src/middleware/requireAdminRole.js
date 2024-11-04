import HttpException from "../exceptions/HttpException.js";

export default async function requireAdminRole(req, res, next) {
  if (req.user.role != "admin") {
    throw new HttpException(403, "This account dont have enough permission.");
  }
  next();
}
