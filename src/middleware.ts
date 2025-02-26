import { Request , Response , NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_PASSWORD } from "./config";



declare global {
    namespace Express {
        export interface Request {
            userId? : string
        }
    }
}

export const userMidddleware  = (req:Request,res:Response,next:NextFunction) =>{
    
    const header = req.headers["authorization"] ;
    const decoded = jwt.verify(header as string  ,JWT_PASSWORD);
    if(decoded) {
        
        if(typeof decoded === "string"){
            res.status(403).json({
                message: " You are not logged in "
            })
            return ;
        }
        req.userId = (decoded as JwtPayload).id;
        next()
       
    }
    else {
        res.status(403).json({
            message :"you are not loggged in"
        })
    }

}

//how to override the types of the express request object 