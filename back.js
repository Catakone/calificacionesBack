const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

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
    require: [true, "Propety is require"],
  },
  calificacion: {
    type: Number,
    require: [true, "Propety is require"],
  },
});

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    require: [true, "Propety is require"],
  },
  edad: {
    type: Number,
    require: [true, "Propety is require"],
  },
  correo: {
    type: String,
    require: [true, "Propety is require"],
  },
  password: {
    type: String,
    require: [true, "Propety is require"],
  },
});

const materSchema = new mongoose.Schema({
  nombre: {
    type: String,
    require: [true, "Propety is require"],
  },
});

//Definir el modelo
const Calificacion = mongoose.model("calificaciones", caliSchema);
const Usuario = mongoose.model("usuarios", userSchema);
const Materia = mongoose.model("materias", materSchema);
function agruparPorUsuario(calificaciones) {
    const agrupado = calificaciones.reduce((acumulador, calificacionActual) => {
      if (!acumulador[calificacionActual.id_usuario]) {
        acumulador[calificacionActual.id_usuario] = {
          alumno: calificacionActual.alumno,
          id_usuario: calificacionActual.id_usuario,
          materias: [
            {
              id_materia: calificacionActual.id_materia,
              nombre: calificacionActual.materia,
              calificacion: calificacionActual.calificacion,
            },
          ],
        };
      } else {
        acumulador[calificacionActual.id_usuario].materias.push({
          id_materia: calificacionActual.id_materia,
          nombre: calificacionActual.materia,
          calificacion: calificacionActual.calificacion,
        });
      }
  
      return acumulador;
    }, {});
  
    return Object.values(agrupado);
  }
//ruta para obtener los datos de las calificaciones
app.get("/calificaciones", async (req, res) => {
  try {
    const calificaciones = await Calificacion.find();
    // const usuarios = await Usuario.findById(req.params.userId);

    let nuevasCalif = await Promise.all(
      calificaciones.map(async (element) => {
        const userInfo = await Usuario.findById(element.id_usuario);
        if(!userInfo) return;
        const materInfo = await Materia.findById(element.id_materia);

        return {
          _id: element._id,
          alumno: userInfo.nombre,
          id_usuario: userInfo._id,
          materia: materInfo.nombre,
          id_materia: materInfo._id,
          calificacion: element.calificacion,
          status: "OK",
        };
      })
    );
    nuevasCalif = nuevasCalif.filter((element) => element);
    
    res.json(agruparPorUsuario(nuevasCalif) );
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//ruta get para los alumnos
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    newUsuarios = usuarios.map((usuario) => {
      const { _id, ...usuarioSinId } = usuario.toObject();
      return {
        id: _id,
        ...usuarioSinId,
      };
    });
    res.json(newUsuarios);
  } catch (error) {
    res.status(500).json({ e: error });
  }
});

//ruta para escribir nuevas calificaciones
app.post("/calificaciones", async (req, res) => {
  // try {
    const numeo = [1,2,3,4,5]
    const clificaciones = [{id_usuario :"661b1d0be180a49b00da2d21", id_materia: "65fcd40862c99603aff37ebe", calificacion:5}]
    const calificaciones = req.body;
    await Promise.all(
      calificaciones.map(async (calificacion) => {
        const nuevaCalificacion = new Calificacion(calificacion);
        await nuevaCalificacion.save();
      })
    );
    res.status(201).json({ message: "Calificaciones agregadas" });
  // } catch (error) {
  //   console.error("Error al agregar las calificaciones:", error);
  //   res.status(500).json( error );
  // }
});

//ruta para escribir nuevos alumnos
app.post("/usuarios", async (req, res) => {
  try {
    const usuarios = new Usuario(req.body);
    await usuarios.save();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userActualizado = await Usuario.findByIdAndUpdate(id, req.body);
    res.json(userActualizado);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userEliminado = await Usuario.findByIdAndDelete(id, req.body);
    res.json(userEliminado);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
//ruta para actualizar calificaciones
app.put("/calificaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const calActualizado = await Calificacion.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(calActualizado);
  } catch (error) {
    console.error("Error al actualizar alumno:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//ruta para eliminar calificaciones
app.delete("/calificaciones/:id", async (req, res) => {
  try {
    await Calificacion.findByIdAndDelete(req.params.id);
    res.json({ message: "Calificacion eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

//Login
app.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ correo, password });
    if (!usuario) {
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});



//inicia el servidor

app.listen(3000, () => {
  console.log("Servidor prendido en http://localhost:3000");
});
