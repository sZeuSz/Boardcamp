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

// Games Routes 

app.get('/games', async (req, res) => {

    const{ name } = req.query;

    try{
        if(name){

            const searchNameGameMatch = await connection.query('SELECT * FROM games WHERE name ILIKE $1;', [`${name}%`]);

            return res.send(searchNameGameMatch.rows);
        }

        const games = await connection.query(`SELECT * FROM games;`);

        return res.send(games.rows);
    }
    catch (error) {
        
        res.sendStatus(500);
    }
})

app.post('/games', async (req, res) => {

    const{
        name,
        image,
        stockTotal,
        categoryId,
        pricePerDay
    } = req.body;

    try {
        const categoriesCheckId = await connection.query('SELECT id FROM categories WHERE $1;', [categoryId]);

        if(!categoriesCheckId.rows.length){

            return res.sendStatus(400);
        }

        const gamesCheckName = await connection.query('SELECT * FROM games WHERE name=$2;', [name])

        if(gamesCheckName.rows.length){

            return res.sendStatus(409);
        }

        const inserirGames = await connection.query(`INSERT INTO games (name, image,"stockTotal", "categoryId", "pricePerDay") VALUES ('${name}','${image}', '${stockTotal}', '${categoryId}', '${pricePerDay}' );`);

        return res.sendStatus(201); 
    }
    catch (error){

        return res.sendStatus(500);
    }

})

