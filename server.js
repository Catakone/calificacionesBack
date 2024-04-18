const express = require("express");
const mysql = require("mysql");
const bodyparser = require("body-parser");
const app = express();

app.listen(3000,()=>{
    console.log("Servidor prendido http://localhost:3000");

});

app.use(bodyparser.json());

const conection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"manga"
});

conection.connect((err)=>{
    if (err) {
        console.error("Fallo, fuchi",err);
    }
    else{
        console.log("ta bien ovo");
    }
});

app.get("/",(req,res)=>{
    res.send("Welcome owo");
    
});

app.get("/mostrarmanga",(req,res)=>{
    conection.query("SELECT * FROM mangawa",(err,row)=>{
        if (err) {
            console.error("error en consulta", err);
            res.status(404).send(" qwq");
        } else {
            res.json(row);
        }
    });
});

app.post("/escribirmanga", (req,res)=>{
    let user = req.body;
    conection.query("INSERT INTO mangawa SET ?",user,(err,row)=>{
        if (err) {
            console.error("error al postear",err);
            res.status(500).send( "error");
        } else {
            res.json(row);
            
        }
    });
});

app.delete("/eliminar/:id",(req,res)=>{
    const id = res.params.id;

    conection.query(
        "DELETE FROM TU_TABLA WHERE id_manga = ?",
        [id],
        (err,row)=>{
            if(err){
                console.error("Error de eliminacion", id);
                res.status(500).send("Error interno");
                return;
            }

            if(row.affectedRows === 0){
                res.status(404).send("Registro weno");
            }
            else{
                res.status(200).send(row.affectedRows);
            }
        }
    )
})