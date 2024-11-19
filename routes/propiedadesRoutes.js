import express from "express"
import { body } from 'express-validator'

import {admin,crear,guardar,agregarImagen,almacenarImagen,editar,guardarCambios,eliminar,cambiarEstado,mostrapropiedad,enviarMensaje,verMensajes} from "../controllers/propiedadController.js"
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'
import  indentificarUsuario from '../middleware/identificarUsuario.js'

const router = express.Router();


router.get('/mis-propiedades',protegerRuta,admin)
router.get('/propiedades/crear',protegerRuta,crear);
router.post('/propiedades/crear', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del Anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacia')
        .isLength({max: 100}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Seleccionar un rango de precio'),
    body('habitaciones').isNumeric().withMessage('Seleccione habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecione estacionamiento'),
    body('wc').isNumeric().withMessage('Selecione la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
    guardar);

router.get('/propiedades/agregar-imagen/:id',protegerRuta,agregarImagen)
router.post('/propiedades/agregar-imagen/:id',protegerRuta, upload.single('imagen'),almacenarImagen)


router.get('/propiedades/editar/:id',
    protegerRuta,
    editar
)

router.post('/propiedades/editar/:id', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del Anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacia')
        .isLength({max: 100}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Seleccionar un rango de precio'),
    body('habitaciones').isNumeric().withMessage('Seleccione habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecione estacionamiento'),
    body('wc').isNumeric().withMessage('Selecione la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
    guardarCambios);

router.post('/propiedades/eliminar/:id',protegerRuta,eliminar)

router.put('/propiedades/:id',protegerRuta,cambiarEstado)



//Area publica
router.get('/propiedad/:id',indentificarUsuario,mostrapropiedad)

//Almacenar los mensajes
router.post('/propiedad/:id',
    indentificarUsuario,
    body('mensaje').isLength({min:10}).withMessage('El mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
)

router.get('/mensajes/:id',protegerRuta,verMensajes)

export default router



