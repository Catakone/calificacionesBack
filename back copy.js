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
const caliSchema = new mongoose.Schema({
    
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        require: [true, " Propety is require"],
    },
    id_materia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Materia",
        require: [true, "Propety is require"]
    },
    calificacion: {
        type: Number,
        require: [true, "Propety is require"]
    }
});

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        require: [true,"Propety is require"]
    },
    edad: {
        type: Number,
        require: [true,"Propety is require"]
    },
    correo: {
        type: String,
        require: [true,"Propety is require"]
    },
    password: {
        type: String,
        require: [true,"Propety is require"]
    }

});

const materSchema = new mongoose.Schema({
    nombre: {
        type: String,
        require: [true,"Propety is require"]
    },

});
 

//Definir el modelo
const Calificacion = mongoose.model("calificaciones", caliSchema);
const Usuario = mongoose.model("usuarios", userSchema);
const Materia = mongoose.model("materias", materSchema);

//ruta para obtener los datos de las calificaciones
app.get("/calificaciones", async(req, res) => {
    try{
 
        const calificaciones = await Calificacion.find();
       

        let nuevasCalif = await Promise.allSettled(
            calificaciones.map( async (elemet) => {
                const userInfo = await Usuario.findById(elemet.id_usuario);
                const materInfo = await Materia.findById(elemet.id_materia);
                return {
                    // userInfo: userInfo,
                    // materInfo,
                    // calificacion: elemet.calificacion,
                    // _id: elemet._id,
                    datos: elemet.calificacion
                };
               
            })
        );

        res.json(nuevasCalif.map(c => {
            
            const {userInfo, materInfo,calificacion,} = c.value
            return {userInfo, materInfo,calificacion}
        }));
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });

    }

});

//ruta get para los alumnos
app.get("/usuarios", async(req, res) => {
    try{
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error){
        res.status(500).json({error: "Error del servidor"});
    }
});


//ruta para escribir nuevas calificaciones
app.post("/calificaciones", async(req, res) => {
    try {
        const calificaciones = req.body;
        await Promise.all(calificaciones.map(async (calificacion) => {
            const nuevaCalificacion = new Calificacion(calificacion);
            await nuevaCalificacion.save();
        }));
        res.status(201).json({ message: 'Calificaciones agregadas' });
      } catch (error) {
        console.error('Error al agregar las calificaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    });

//ruta para escribir nuevos alumnos
app.post("/usuarios", async(req, res) => {
    try{
        const usuarios = new Usuario(req.body);
        await usuarios.save();
        res.json(usuarios);
    } catch (error){
        res.status(500).json({error: "Error del servidor"});
    }
});

//ruta para actualizar calificaciones
app.put("/calificaciones/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const calActualizado = await Calificacion.findByIdAndUpdate(id, req.body, { new: true });
        res.json(calActualizado);
      } catch (error) {
        console.error('Error al actualizar alumno:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
});

//ruta para eliminar calificaciones
app.delete("/calificaciones/:id", async(req, res) => {
    try{
        await Calificacion.findByIdAndDelete(req.params.id);
        res.json({message: "Calificacion eliminada"});
    } catch (error){
        res.status(500).json({error: "Error del servidor"});
    }
});



//inicia el servidor

app.listen(3000, () => {
    console.log("Servidor prendido en http://localhost:3000");
});