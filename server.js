const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")

const app = express()

app.use(cors())
app.use(express.json())

// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/aistudyapp")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// User schema
const userSchema = new mongoose.Schema({
name:String,
email:{type:String,unique:true},
password:String
})

const User = mongoose.model("User",userSchema)


// SIGNUP
app.post("/signup", async(req,res)=>{

const {name,email,password} = req.body

try{

const existing = await User.findOne({email})

if(existing){
return res.json({message:"User already exists"})
}

const hashed = await bcrypt.hash(password,10)

const user = new User({
name,
email,
password:hashed
})

await user.save()

res.json({message:"Signup successful"})

}catch(err){

res.json({message:"Error creating user"})

}

})


// LOGIN
app.post("/login", async(req,res)=>{

const {email,password} = req.body

try{

const user = await User.findOne({email})

if(!user){
return res.json({message:"User not found"})
}

const match = await bcrypt.compare(password,user.password)

if(!match){
return res.json({message:"Wrong password"})
}

res.json({
message:"Login successful",
user:{name:user.name,email:user.email}
})

}catch(err){

res.json({message:"Server error"})

}

})


// ================== CHATBOT ==================

const API_KEY="YOUR_OPENAI_API_KEY"

app.post("/chat",async(req,res)=>{

try{

const userMessage=req.body.message

const response=await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+API_KEY
},
body:JSON.stringify({
model:"gpt-4.1-mini",
messages:[
{role:"system",content:"You are a helpful AI study assistant."},
{role:"user",content:userMessage}
]
})
})

const data=await response.json()

res.json({
reply:data.choices[0].message.content
})

}catch(err){

res.status(500).json({error:"AI request failed"})

}

})



app.listen(5000,()=>{
console.log("Server running on http://localhost:5000")
})