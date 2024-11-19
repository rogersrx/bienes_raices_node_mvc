import {exit} from 'node:process'
import categorias from './categorias.js'
import precios from './precios.js'
import usuarios from './usuarios.js'
import db from '../config/db.js'

import {Categoria,Precio, Usuario} from '../models/index.js';


const importDatos = async () =>{
    try{

        //Authenticar
        await db.authenticate();

        // Generar  las columnas
        await db.sync();

        // Insertamos los datos

        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])
        console.log('Datos Importandos Correctamente')
        exit()

    }catch(error){
        console.log(error)
        process.exit(1)
    }
}
const eliminarDatos = async () =>{

    try{

        await db.sync({force: true})
       /* await Promise.all([
            Categoria.destroy({where: {}, truncate: true}),
            Precio.destroy({where:{}, truncate: true})
        ]);
        */
        console.log("Proceso eliminado");

        exit();

    }catch(error){
        console.log(error),
        exit(1)
    }

}

if(process.argv[2] === "-i"){
    importDatos();
}

if(process.argv[2] === "-e"){
    eliminarDatos();
}
