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

// Customers Routes

app.get('/customers', async (req, res) => {

    const {cpf} = req.query;

    try{

        if(cpf){
            const searchCustoumerCpfMatch = await connection.query('SELECT * FROM customers WHERE cpf LIKE $1;', [`${cpf}%`]);

            return res.send(searchCustoumerCpfMatch.rows);
        }

        const customers = await connection.query('SELECT * FROM customers;');


        return res.send(customers.rows);
    }
    catch (error){

        return res.sendStatus(500);
    }
})

app.get('/customers/:id', async (req, res) => {

    const {id} = req.params;

    try{
        
        const customerById = await connection.query('SELECT * FROM customers WHERE id=$1;', [id])

        if(!customerById.rows.length){

            return res.sendStatus(404);
        }

        return res.send(customerById.rows);
    }
    catch (error){

        return res.sendStatus(500);
    }

})

app.post('/customers', async (req, res) => {

    const{
        name,
        phone,
        cpf,
        birthday
    } = req.body;
    
    let validCpf = /[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}/;
    let validDate = /^([0-9]{4}[-/]?((0[13-9]|1[012])[-/]?(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])[-/]?31|02[-/]?(0[1-9]|1[0-9]|2[0-8]))|([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00)[-/]?02[-/]?29)$/;
    let validPhone = /[0-9]{11}|[0-9]{10}/;

    if(!validCpf.test(cpf) || cpf.length !== 11 || !validPhone.test(phone) || (phone.length !== 10 && phone.length !== 11) || !name.length || !validDate.test(birthday) ){

        return res.sendStatus(400)
    }

    try{
        const cpfCheck = await connection.query('SELECT * FROM customers WHERE cpf= $1', [cpf]);

        if(cpfCheck.rows.length){

            return res.sendStatus(409);
        }

        const insertCustomer = await connection.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)', [name, phone, cpf, birthday])

        return res.sendStatus(201)
    }
    catch (error){

        return res.sendStatus(500)
    }
})

app.put('/customers/:id', async (req, res) => {

    const { id } = req.params;

    const {
        name,
        phone,
        cpf,
        birthday
    } = req.body;

    let validCpf = /[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}/;
    let validDate = /^([0-9]{4}[-/]?((0[13-9]|1[012])[-/]?(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])[-/]?31|02[-/]?(0[1-9]|1[0-9]|2[0-8]))|([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00)[-/]?02[-/]?29)$/;
    let validPhone = /[0-9]{11}|[0-9]{10}/;

    if(!validCpf.test(cpf) || cpf.length !== 11 || !validPhone.test(phone) || (phone.length !== 10 && phone.length !== 11) || !name.length || !validDate.test(birthday) ){

        return res.sendStatus(400)
    }

    try {
        const customerById = await connection.query('SELECT * FROM customers WHERE id=$1', [id]);
        
        if(!customerById.rows.length){

            return res.sendStatus(404);
        }

        const customerByCpf = await connection.query('SELECT * FROM customers WHERE cpf=$1', [cpf]);

        if(customerByCpf.rows.length){

            return res.sendStatus(409)
        }

        const updateCustomer = await connection.query('UPDATE customers SET (name, phone, cpf, birthday) = ($1, $2, $3, $4) WHERE id=$5', [name, phone, cpf, birthday, id]);

        return res.sendStatus(200)
    }
    catch (error){

        return res.sendStatus(500);
    }
})
