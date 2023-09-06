import express from "express";
import axios from "axios";
import {createClient} from "redis"
import cors from "cors"
import mysql from "mysql2"

const app = express();
// Create Redis Client
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:false}))

//mysql Client
const db=mysql.createConnection({
  host:"127.0.0.1",
  user:"root",
  password:"Albralelie12@",
  database:"sluts",
})

db.connect((err)=>{
  if(err){
    console.log("Connection with MYSQL Failed",err)
  }else{
    console.log("Connect with MYSQL DB.....")
  }
})
 
///

////
const client=createClient();
client.on("error",(error)=>console.log("Redis client Error",error))
const connect=async()=>{
  try{
  
    await client.connect()
    console.log("Succesfully connect to REDIS")
  }catch(err){
    console.log("Conenction to Redis fail")
  }
}
connect();


app.get("/",(req,res)=>{
  return res.send("REDIS API HOME PAGE")
})
const DEFAULT_EXPIRATION=3600
app.get("/photos",async(req,res)=>{
  try{
    const albumId=req.query.albumId;
    const value=await client.get(`photos:${albumId}`);
    if(value){
      console.log("Hit match")
      return res.json(JSON.parse(value))
    }else{
      console.log("Cache miss")
      const {data}=await axios.get("https://jsonplaceholder.typicode.com/photos",{
        params:{
          albumId
        }
      })
      client.setEx(`photos:${albumId}`,DEFAULT_EXPIRATION,JSON.stringify(data))
      return res.json(data)
    }
  }catch(err){
    return res.json(err)
  }
})


// app.get('/database', (req, res) => {

//   const q="SELECT * FROM my_sluts";
//   db.query(q,async(err,data)=>{
//     if(err)return res.status(500).json(err)
//     const value=await client.get("nombre")
//     if(value){
//       console.log("Hit value from redis")
//       return res.json(JSON.parse(value))
//     }else{
//       console.log("Cache MISS")
//       client.setEx("nombre",DEFAULT_EXPIRATION,JSON.stringify(data))
//       return res.json(data)
//     }
//   })
//   });

app.listen(3000, () => console.log("Listening on port 3000"));


