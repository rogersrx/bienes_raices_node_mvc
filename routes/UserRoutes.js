import express from "express";
import {formulariologin,cerrarSesion,formularioregistro,formularioolvide,save,confirmar,resetPasword,comprobarToken,nuevoPassword,autenticar} from "../controllers/userController.js";

const router = express.Router();

//vistas
router.get('/login',formulariologin);
router.post('/login',autenticar);


// cerrar sesion

router.post('/cerrar-sesion', cerrarSesion)



router.get('/registro',formularioregistro);
router.get('/olvide',formularioolvide);
router.get('/confirmar/:token', confirmar);




//acciones
router.post("/save",save);
router.post("/olvide",resetPasword);

router.get('/olvide-password/:token',comprobarToken);
router.post('/olvide-password/:token',nuevoPassword);




  export default router;