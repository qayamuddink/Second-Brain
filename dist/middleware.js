"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMidddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const userMidddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    const decoded = jsonwebtoken_1.default.verify(header, config_1.JWT_PASSWORD);
    if (decoded) {
        if (typeof decoded === "string") {
            res.status(403).json({
                message: " You are not logged in "
            });
            return;
        }
        req.userId = decoded.id;
        next();
    }
    else {
        res.status(403).json({
            message: "you are not loggged in"
        });
    }
};
exports.userMidddleware = userMidddleware;
//how to override the types of the express request object 
