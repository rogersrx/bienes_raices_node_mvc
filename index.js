import  express from "express";
import csrf from 'csurf'

import usuarioRoutes from './routes/UserRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js';
import cookieParser from "cookie-parser";

//Crear la pp
const app = express();

// Habilitar lectura de datos de formularios
app.use( express.urlencoded({extended: true}));
app.use( express.json());
//Habilitar cookie parser
app.use(cookieParser());

//Habilitar el CSRF
app.use(csrf({cookie: true}));

//Conexion a la base de datos
try{
    await db.authenticate();
    db.sync();
    console.log('Se establecion la conexion a la base de datos');
}catch (error) {
    console.log(error);
}

// Habilitar Pug
app.set('view engine','pug');
app.set('views','./views');

// Carpeta public
app.use( express.static('public') );

//Routing
app.use('/',appRoutes)
app.use('/auth',usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api',apiRoutes)







// Definir puerto
const port = 3000;

app.listen(port,() => {
    console.log(`El servidor esta funcionando  en el puerto ${port}`)
})
