import express from 'express';
import pg from 'pg';
import cors from 'cors';
import { json } from 'express';
import dayjs from 'dayjs';
const { Pool } = pg;

const user = 'bootcamp_role';
const password = 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp';
const host = 'localhost';
const port = 5432;
const database = 'boardcamp';

const connection = new Pool({
  user,
  password,
  host,
  port,
  database
});

const app = express();

app.use(cors());
app.use(json());

// Categories Routes
app.get('/categories', async (req, res) => {
    
    try{
        const categories = await connection.query(`SELECT * FROM categories;`)

        return res.send(categories.rows);
    }
    catch (error){

        res.sendStatus(500);
    }
})

app.post('/categories', async (req, res) => {
    
    const {name} = req.body;

    if(!name.length){

        return res.sendStatus(400);
    }
    
    try{
        const namesCategories = await connection.query(`SELECT name FROM categories;`);

        if(!namesCategories.rows.length){

            await connection.query('INSERT INTO categories (name) VALUES ($1);', [name]);

            return res.sendStatus(201);
        }
        else{

            if(namesCategories.rows.filter((row) => row.name === name).length){

                return res.sendStatus(409);
            }
            else{
                
                await connection.query('INSERT INTO categories (name) VALUES ($1);', [name]);

                return res.sendStatus(201); 
            }
        }
    }   
    catch (error){

        res.sendStatus(500);
    }
})
