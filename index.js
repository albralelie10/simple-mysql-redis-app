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
  const dataRequest=await getCacheStatus(`photos?albumId:${albumId}`,async ()=>{
    const {data}=await axios.get("https://jsonplaceholder.typicode.com/photos",{
        params:{
          albumId
        }
      })
      return data;
  })
    return res.json(dataRequest)
  }catch(err){
    return res.status(500).json(err)
  }
})

app.get("/photos/:id",async(req,res)=>{
  try{
  const dataRequest=await getCacheStatus(`photos:${req.params.id}`,async ()=>{
    const {data}=await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`)
      return data;
  })
    return res.json(dataRequest)
  }catch(err){
    return res.status(500).json(err)
  }
})

function  getCacheStatus(key,cb){
  return new Promise(async(resolve,reject)=>{
    try{
      const value=await client.get(key)
      if(value)return resolve(JSON.parse(value))
      const freshData=await cb()
      client.setEx(key,DEFAULT_EXPIRATION,JSON.stringify(freshData))
      resolve(freshData)
    }catch(err){
      return reject(err)
    }
    
  })
}

app.get('/database', (req, res) => {

  const q="SELECT * FROM my_sluts";
  db.query(q,async(err,data)=>{
    if(err)return res.status(500).json(err)
    const value=await client.get("nombre")
    if(value){
      console.log("Hit value from redis")
      return res.json(JSON.parse(value))
    }else{
      console.log("Cache MISS")
      client.setEx("nombre",DEFAULT_EXPIRATION,JSON.stringify(data))
      return res.json(data)
    }
  })
  });

app.listen(3000, () => console.log("Listening on port 3000"));






