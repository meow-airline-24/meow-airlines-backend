import serializeError from "./serializeError.js";

export default (func) => (req, res, next) => {
    func(req, res, next).catch((error) => {
        if (res.headersSent) {
            // If the headers are already sent, delegate the error to the default Express error handler
            return next(error);
        }

        const e = serializeError(error);
        res.status(e.status).json(e);
    });
};
