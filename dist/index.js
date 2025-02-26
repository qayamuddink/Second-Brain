"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const config_1 = require("./config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = __importDefault(require("zod"));
const utils_1 = require("./utils");
const middleware_1 = require("./middleware");
// import { random } from "./utils";
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// app.post("/api/v1/signup" , async(req,res) => {
//     const requiredBody = z.object({
//         username : z.string().min(5).max(10),
//         password : z.string() 
//     })
//     const isvalidate = requiredBody.safeParse(req.body);
//     if(!isvalidate.success){
//         res.json({
//             msg: " incorrect credential" ,
//             error : isvalidate.error.errors
//         })
//         return
//     }
//     const username = req.body.username ;
//     const password = req.body.password ;
//     const hashedPassword = await bcrypt.hash(password ,5)
//     try { 
//         await userModel.create({
//             username,
//             password : hashedPassword
//         })
//         res.json({
//             msg : "signup successfully"
//         })
//     }catch(e){
//         res.status(403).json({
//             msg : "user already exist"
//         })
//     }
// })
// app.post("/api/v1/signin" , async (req,res) => {
//     const username = req.body.username ;
//     const password = req.body.password ;
//     console.log("hi there")
//     const existingUser = await userModel.findOne({
//         username
//     })
//     if(!existingUser){
//         res.json({
//             msg:"user is exist in the data base"
//         })
//         return
//     }
//     console.log(existingUser);
//     const passwordMatch = await bcrypt.compare(password, existingUser.password ?? "");
//     console.log(passwordMatch);
//     if(passwordMatch){
//         const token = jwt.sign({
//             id : existingUser._id
//         } ,JWT_PASSWORD)
//         res.json({
//             token
//         })
//     }else{
//         res.status(403).json({
//             msg :"incorrect credential"
//         })
//     }
// })
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.default.object({
        username: zod_1.default.string(),
        password: zod_1.default.string()
    });
    console.log("hi there");
    const validatingBody = requiredBody.safeParse(req.body);
    console.log(validatingBody);
    if (!validatingBody.success) {
        res.status(403).json({
            msg: "required body is not validated"
        });
        return;
    }
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = yield bcrypt_1.default.hash(password, 6);
    console.log(hashedPassword);
    try {
        yield db_1.userModel.create({
            username,
            password: hashedPassword
        });
        res.json({
            msg: "signup successfull"
        });
    }
    catch (e) {
        res.status(403).json({
            msg: "user already exist"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = req.body.username;
    const password = req.body.password;
    const existedUser = yield db_1.userModel.findOne({
        username
    });
    if (!existedUser) {
        res.status(403).json({
            msg: "user is not in the data base"
        });
        return;
    }
    const passwordMatch = yield bcrypt_1.default.compare(password, (_a = existedUser.password) !== null && _a !== void 0 ? _a : "");
    if (passwordMatch) {
        const token = jsonwebtoken_1.default.sign({
            id: existedUser._id
        }, config_1.JWT_PASSWORD);
        res.json({
            token
        });
    }
    else {
        res.json({
            msg: "incorrect credential"
        });
    }
}));
// app.post("/api/v1/content",userMidddleware ,async(req,res) => {
//     const {link ,title} = req.body
//     await contentModel.create({
//         title,
//         link,
//         //@ts-ignore
//         userId:req.userId,
//         tag : []
//     })
//     res.json({
//         msg: "content added successfully"
//     })
// })
// app.get("/api/v1/content" ,userMidddleware ,async  (req,res) => {
//     //@ts-ignore
//     const userId = req.userId;
//     const content = await contentModel.find({
//         userId :userId
//     }).populate("userId","username")
//     res.json({
//         content
//     })
// })
// app.delete("/api/v1/delete" ,userMidddleware ,async (req,res)=> {
//     const contentId = req.body.contentId;
//     const deletingContent = await contentModel.deleteMany({
//         contentId,
//         //@ts-ignore
//         userId:req.userId
//     })
//     res.json({
//         deletingContent
//     })
// })
app.post("/api/v1/content", middleware_1.userMidddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const link = req.body.link;
    yield db_1.contentModel.create({
        link,
        type,
        title: req.body.title,
        userId: req.userId,
        tag: []
    });
    res.json({
        msg: "content added"
    });
}));
app.get("/api/v1/content", middleware_1.userMidddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const content = yield db_1.contentModel.find({
        userId: userId,
    }).populate("userId", "username");
    res.json({
        content
    });
}));
app.delete("/api/v1/delete", middleware_1.userMidddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    const content = yield db_1.contentModel.find({
        contentId,
        //@ts-ignore
        userId: req.userId
    }).populate("userId", "username");
    const contentDelete = yield db_1.contentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    }).populate("userId", "username");
    res.json({
        contentDelete,
        delete: content
    });
}));
app.post("/api/v1/brain/share", middleware_1.userMidddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield db_1.linkModel.findOne({
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.linkModel.create({
            userId: req.userId,
            hash: hash
        });
        res.json({
            message: "/share/" + hash
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            userId: req.userId
        });
        res.json({
            message: "removed link link"
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.linkModel.findOne({
        hash
    });
    if (!link) {
        res.status(411).json({
            message: "sorry incorrect input"
        });
        return;
    }
    const content = yield db_1.contentModel.find({
        userId: link.userId
    });
    const user = yield db_1.userModel.findOne({
        _id: link.userId.toString()
    });
    if (!user) {
        res.status(411).json({
            msg: "user not found , error should ideally not happen "
        });
        return;
    }
    res.json({
        username: user.username,
        content
    });
}));
app.listen(3000);
