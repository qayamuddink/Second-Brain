import express from "express" ;
import jwt from "jsonwebtoken";
import { contentModel, linkModel, userModel } from "./db";
import { JWT_PASSWORD } from "./config";
import bcrypt from "bcrypt"
import z from "zod"
import { random } from "./utils";
import { userMidddleware } from "./middleware";
import cors from "cors"

const app = express() ;

app.use(express.json()) ;
app.use(cors());



app.post("/api/v1/signup" ,async (req,res) => {
    const requiredBody = z.object ({
        username : z.string(),
        password : z.string()
    })
    

    const validatingBody = requiredBody.safeParse(req.body) ;

    if(!validatingBody.success){
        res.status(403).json({
            msg : "required body is not validated"
        })
        return
    }
    const username  = req.body.username ;
    const password = req.body.password ;
    const hashedPassword = await bcrypt.hash(password ,6) ;
    
    try{
            await userModel.create({
            username,
            password : hashedPassword
        })
        res.json({
            msg : "signup successfull"
        })
    }catch(e){
        res.status(403).json({
            msg : "user already exist"
        })
    }

})

app.post("/api/v1/signin" ,async (req,res)=>{
    const username = req.body.username ;
    const password = req.body.password ;
    const existedUser = await userModel.findOne({
        username
    })
    if(!existedUser){
        res.status(403).json({
            msg : "user is not in the data base"
        })
        return 

    }

    const passwordMatch = await bcrypt.compare(password,existedUser.password ?? "");
    if(passwordMatch){
        const token = jwt.sign({
            id : existedUser._id
        },JWT_PASSWORD)
        res.json({
            token 
        })
    }else {
        res.json({
            msg: "incorrect credential"
        })
    }
})





app.post("/api/v1/content" ,userMidddleware ,async(req,res) => {

    const type = req.body.type ;
    const link = req.body.link ;
     await contentModel.create({
        link,
        type,
        title:req.body.title,        
        userId :req.userId,
        tag :[]
    })

    res.json({
        msg : "content added"
    })
})


app.get("/api/v1/content" ,userMidddleware , async (req ,res) => {
    
    const userId = req.userId ;
    const content = await contentModel.find({
        userId :userId,

    }).populate("userId" , "username")

    res.json({
        content
    })
})


app.delete("/api/v1/delete" ,userMidddleware ,async (req,res) => {
    const contentId = req.body.contentId;
    const content = await contentModel.find({
        contentId ,
        userId :req.userId
    }).populate("userId" , "username")
    const contentDelete = await contentModel.deleteMany({
        contentId ,
        
        userId:req.userId 
    }).populate("userId" ,"username")
    
    res.json({
        contentDelete ,
        delete:content
    })
})

app.post("/api/v1/brain/share", userMidddleware , async (req ,res) => {
    const share = req.body.share ;
    if(share) {
        
        const existingLink = await linkModel.findOne({
            
            userId: req.userId
        })
        if(existingLink){
            res.json({
                hash :existingLink.hash
            })
        return
        }

        
              const hash = random(10)
                await linkModel.create({
                
                userId:req.userId,
                hash: hash
                })
                res.json({
                    message : "/share/" + hash
                })     
    }else{
        await linkModel.deleteOne({
            
            userId:req.userId
        })
        res.json({
            message : "removed link link"
        })
    }
    
    



})

app.get("/api/v1/brain/:shareLink" , async (req , res) => {
    const hash = req.params.shareLink;

    const link = await linkModel.findOne({
        hash
    });

    if(!link){
        res.status(411).json({
            message: "sorry incorrect input"
        })
        return 
    }

    const content = await contentModel.find({
        userId :link.userId
    })
    const user = await userModel.findOne({
        _id : link.userId.toString()
    })    

    if(!user) {
        res.status(411).json({
            msg : "user not found , error should ideally not happen "
        })
        return
    }

    res.json( {
        username : user.username ,
        content
    })

})


app.listen(3000)










