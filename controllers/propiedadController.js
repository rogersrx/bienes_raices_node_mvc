import { validationResult } from 'express-validator'
import { unlink } from 'node:fs/promises'
import { Precio, Categoria, Propiedad , Mensaje,Usuario} from '../models/index.js';
import { esVandedor ,formatearFecha } from '../helpers/index.js'

const admin = async (req, res) =>{

//clientes?id=20  leer queryString


    const { pagina: pagActual } = req.query

    const expresionreg = /^[1-9]$/  // validar que solo sea numero

    if(!expresionreg.test(pagActual)){ // vALIDAR QUE SOLO SEA NUMERO
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try{            
        const { id } = req.usuario

        // Limites y offset para el paginador
        const limit = 10
        const offset = ((pagActual*limit) -limit)

        const [propiedades,total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where:{
                    usuarioId: id
                },
                include:[
                    {model: Categoria,as:'categoria'},
                    {model: Precio, as:'precio'},
                    {model: Mensaje, as:'mensajes'}
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])

        

        
        res.render('propiedades/admin',{
            pagina:'Mis propiedades',
            csrfToken: req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total/limit),
            pagActual: Number(pagActual),
            limit,
            offset,
            total
        });

    }catch(error){
        console.log(error)
    }


}

const crear = async (req, res) =>{


    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);



    res.render('propiedades/crear',{
        pagina:'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos:{}
    });
}


const guardar = async (req, res) =>{

    // validacion 
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return  res.render('propiedades/crear',{
            pagina:'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores:resultado.array(),
            datos: req.body

        });

    }

    //Crear Registro
    const {titulo,descripcion,categoria:categoriaId, precio:precioId,habitaciones,estacionamiento,wc,calle,lat,lng } = req.body;

    const { id: usuarioId } = req.usuario

   
    try{
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: 'default.png'
    
        })

        const {id } = propiedadGuardada

        res.redirect(`/propiedades/agregar-imagen/${id}`)
    

    }catch(error){

    }


}

const agregarImagen = async (req, res) =>{

    // validar que la propiedad exista 
    const { id }= req.params
  
    // validar que la propiedad no esta publicada
    const propiedad = await Propiedad.findByPk(id);
    // validar que la propiedad ya existe
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // la propiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }    
    // validar que la propiedad pertenece a quien visita a la pagina

    if( req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }


    res.render('propiedades/agregar-imagen',{
        pagina:`Agregar imagen:${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })

}

const almacenarImagen = async (req, res,next)=>{

    // validar que la propiedad exista 
    const { id }= req.params
  
    // validar que la propiedad no esta publicada
    const propiedad = await Propiedad.findByPk(id);
    // validar que la propiedad ya existe
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // la propiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }    
    // validar que la propiedad pertenece a quien visita a la pagina

    if( req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    try {
        //almacenar la imagen y public 
        propiedad.imagen = req.file.filename
        propiedad.publicado=1
        await propiedad.save()
        next()
    } catch(error){

    }
}

const editar = async (req, res)=>{

    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien viista la URL, es quien creo la propiedadf
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }




    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);




    res.render('propiedades/editar',{
        pagina:`Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos:propiedad
    });



}

const guardarCambios = async (req, res) =>{

    const resultado = validationResult(req)

    if(!resultado.isEmpty()){

        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return  res.render('propiedades/editar',{
            pagina:'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores:resultado.array(),
            datos: req.body

        });
    }

    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien viista la URL, es quien creo la propiedadf
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //reescribir el objeto para actualizar
    try{
          //Crear Registro
        const {titulo,descripcion,categoria:categoriaId, precio:precioId,habitaciones,estacionamiento,wc,calle,lat,lng } = req.body;

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,                
            categoriaId, 
            precioId
        })

        await propiedad.save()

        res.redirect('/mis-propiedades')

    } catch(error){
        console.log(error)
    }

}

const eliminar = async (req, res) =>{
    //Validar si existe 
    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien viista la URL, es quien creo la propiedadf
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`)

    await propiedad.destroy()

    res.redirect('/mis-propiedades')


}

// Modificar el esatado de la propiedad

const cambiarEstado = async (req, res) =>{
    //Validar si existe 
    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien viista la URL, es quien creo la propiedadf
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Actualizar
   propiedad.publicado = !propiedad.publicado

   await propiedad.save()

   res.json({
        resultado:true
   })
}


const mostrapropiedad = async (req, res)=>{
    const {id} = req.params
    // comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{      
        include:[
            {model: Categoria,as:'categoria'},
            {model: Precio, as: 'precio'}
        ]
    })

    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404')
    }

    res.render('propiedades/mostrar',{
        propiedad,
        pagina:propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVandedor:esVandedor(req.usuario?.id, propiedad.usuarioId)

    })

}

const enviarMensaje =async (req, res)=>{

    const {id} = req.params

    console.log(req.usuario)

    // comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{      
        include:[
            {model: Categoria,as:'categoria'},
            {model: Precio, as: 'precio'}
        ]
    })

    if(!propiedad){
        return res.redirect('/404')
    }

    // Renderizar 

    const resultado = validationResult(req)

    if(!resultado.isEmpty()){

        return  res.render('propiedades/mostrar',{
            propiedad,
            pagina:propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVandedor:esVandedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
         })
    }
    // almacenar el mensaje 

    const { mensaje }         = req.body
    const { id: propiedadId } = req.params
    const { id: usuarioId }   = req.usuario

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

   /* res.render('propiedades/mostrar',{
        propiedad,
        pagina:propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVandedor:esVandedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true
     })*/

     res.redirect('/')



}

// leer  mensajes recibidos 

const verMensajes = async (req, res) =>{

      //Validar si existe 
      const { id } = req.params

      //validar que la propiedad exista
      const propiedad = await Propiedad.findByPk(id,
        {
            include:[
                {model: Mensaje, as:'mensajes',
                    include:[
                        {model: Usuario.scope('elimnarPassword'), as:'usuario'}
                    ]
                }
            ]
        }
      )
  
      if(!propiedad){
          return res.redirect('/mis-propiedades')
      }
  
      // Revisar que quien viista la URL, es quien creo la propiedadf
      if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
          return res.redirect('/mis-propiedades')
      }

    res.render('propiedades/mensajes',{
        pagina:'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha


    })
}


export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrapropiedad,
    enviarMensaje,
    verMensajes
}