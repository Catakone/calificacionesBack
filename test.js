const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexion a MongoDB"));
db.once("open", () => {
  console.log("Conectado a MongoDB");
});

//Definir el esquema del modelo
const UsuarioSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
});

//Definir el modelo
const Usuario = mongoose.model("Usuario", UsuarioSchema);

//ruta get para obtener ttodos los usuarios
app.get("/usuarios", async (req, res) => {
    try{
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error){
        res.status(500).json({error: "Error del servidor"});
    }
});


//Metodo post para crear un usuario

app.post("/usuarios", async (req, res) => {
    try{
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.json(usuario);
    } catch (error){
        res.status(500).json({error: "Error del servidor"});
    }
});
//metodo delete para eliminar un usuario

app.delete("/usuarios/:id", async (req, res) => {
    try{
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({message: "Usuario  fue eliminado"});
    } catch (error){
        res.status(500).json({error: "Error del servidor"});
    }
});

//metodo put para actualizar un usuario

app.put("/usuarios/:id", async (req, res) => {
    try{
        const usuario = await Usuario.findById(req.params.id);
        usuario.set(req.body);
        await usuario.save();
        res.json(usuario);
    } catch (error){
        res.status(500).json({error: "Error del servidor"});
    }
});
//inicia el servidor

app.listen(3000, () => {
    console.log("Servidor prendido en http://localhost:3000");
});