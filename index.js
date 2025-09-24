import express from 'express'
import cors from "cors"
import { configDB } from "./configDB.js"
import mysql from 'mysql2/promise'

const app = express()
app.use(express.json())
app.use(cors())
const port = 8000
let connection

try {
    connection=await mysql.createConnection(configDB)
} catch (error) {
    console.log(error)
}

app.get('/todos', async (req, resp)=>{
    try {
        const sql = 'SELECT * FROM todolist order by timestamp desc;'
        const [rows, fields]=await connection.execute(sql)
        console.log(rows)
        console.log(fields)
        resp.status(200).send(rows)
    } catch (error) {
        console.log(error)
    }
})

app.post('/todos', async (req, resp)=>{
    if(!req.body) return resp.json({msg:"Hiányos adat!"})
    const {task}=req.body
    console.log(task)

    if(!task ) return resp.json({msg:"Hiányos adat!"})
    try {
        const sql = 'insert into todolist (task) values (?)'
        const values = [task]
        const [result] = await connection.execute(sql, values)
        console.log(result)
        resp.status(201).json({msg:"Sikeres hozzáadás!"})
    } catch (error) {
        console.log(error)
    }
})

app.delete('/todos/:id', async (req, resp)=>{
    const {id} = req.params
    
    try {
        const sql = "delete from todolist where id=?"  
        const values = [id]
        const [rows] = await connection.execute(sql, values)
        console.log(rows.affectedRows)
        if(rows.affectedRows==0) return resp.json({msg:"Nincs mit törölni!"})
        resp.status(200).json({msg:"Sikeres törlés!"})
    } catch (error) {
        console.log(error);
    }
})

app.patch('/todos/:id', async (req, resp)=>{
    const {id} = req.params
    try {
        const sql = "update todolist set completed = NOT completed where id = ?"
        const values = [id]
        const [rows] = await connection.execute(sql, values)
        if(rows.affectedRows==0) return resp.json({msg:"Nincs mit törölni!"})
        resp.status(201).json({msg:"Sikeres módosítás!"})
    } catch (error) {
        console.log(error);
    }
    
})

app.listen(port, ()=>console.log(`server is listening on port ${port}`))