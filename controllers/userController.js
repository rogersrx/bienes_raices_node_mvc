import { check, validationResult }  from  'express-validator'
import bcrypt from 'bcrypt'

import Usuario from '../models/Usuario.js'
import {generarId,generarJWT} from '../helpers/tokens.js'
import {emailRegistro,emailOlvidepassword} from '../helpers/emails.js'

const formulariologin = (req, res) =>{

    return res.render('auth/login',{
        pagina:"Iniciar Sesión",
        csrfToken:req.csrfToken()
    });
}


const autenticar = async (req , res) =>{

    //Validar datos 
    await check('email').isEmail().withMessage('El Email es Obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);

    //validar si el resultado es vacio
    let resultado = validationResult(req);
    if(!resultado.isEmpty()){
        return res.render('auth/login',{
            pagina:'Iniciar Sesión',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        });
    }

    //Comprobar si el usuario existe
    const {email, password} = req.body;

    const usuario = await Usuario.findOne({ where: { email }});

    if(!usuario){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no Existe'}]
        })
    }

    //Comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada, revise su correo'}]
        })

    }

    // Revisar el password

    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}]
        })

    }

    //Autenticar usuario
    const token= generarJWT({id:usuario.id, usuario: usuario.id, nombre: usuario.nombre});

   //Alamcenar en un cookie

   return res.cookie('_token', token ,{
    httpOnly: true,
    //secure: true
    // sameSite: true
   }).redirect('/mis-propiedades')

}

const cerrarSesion = (req, res) =>{



   return res.clearCookie('_token').status(200).redirect('/auth/login')

}


const formularioregistro = (req, res) =>{
    res.render('auth/registro',{
        pagina:"Crear Cuenta",
        csrfToken:req.csrfToken()
    })
}

const save = async (req , res) =>{
    // Obtener datos del requerimiento
    let params = req.body;
    //Validacion
    await check('nombre').notEmpty().withMessage('no puede ser vacio el nombre').run(req);
    await check('email').isEmail().withMessage('no es email correcto').run(req);
    await check('password').isLength({ min:6 }).withMessage('El password debe al menos 6 caracteres').run(req);
    await check('repetir_password').equals(params.password).withMessage('No coinciden las contraseñas').run(req);

    let resultado = validationResult(req);

    // verificar el resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            csrfToken:req.csrfToken(),
            errores:resultado.array(),
            usuario:{
                nombre: params.nombre,
                email: params.email

            }
        });

    }     
    // Verificar que el usuario no este duplicado
    const existuser = await Usuario.findOne({ where :{ email: params.email }});

    if( existuser ){
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            csrfToken:req.csrfToken(),
            errores:[{msg: 'El usuario ya esta Resgistrado'}],
            usuario:{
                nombre: params.nombre,
                email: params.email
            }
        });
    }
    // Alamcenar ussuario 
  params.token=generarId();
  const usuario = await  Usuario.create(params);  

  //Envia email de confirmacion
  emailRegistro({
    nombre:usuario.nombre,
    email:usuario.email,
    token:usuario.token
  })


  //mostrar un mensaje de confirmacion  
    res.render('templates/mensaje',{
        pagina:'Cuenta creada Correctamente',
        mensaje:"Hemos Enviado un Email de Confirmación, presiona en el enlace"
    }); 
}

const confirmar = async (req, res) =>{
    const {token }  = req.params;

    // Verificar el token
    const usuario = await Usuario.findOne({where:{token}});

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error el confirmar tu cuenta, intenta de nuevo',
            error: true
        });
    }
    // confirmar la cuenta   
    usuario.token = null;
    usuario.confirmado = true;

   await usuario.save();

   return res.render('auth/confirmar-cuenta',{
    pagina: 'Cuenta Confirmada',
    mensaje: 'La cuenta se confirmó correctamente',
    error: false
});




}

const formularioolvide = (req, res) =>{
    res.render('auth/olvide',{
        csrfToken:req.csrfToken(),
        pagina:"Recuperar tu acceso a Bienes Raices"
    })
}

const resetPasword = async (req,res) =>{
      //Validacion
      await check('email').isEmail().withMessage('no es email correcto').run(req);

      let resultado = validationResult(req);
  
      // verificar el resultado este vacio
      if(!resultado.isEmpty()){

          return res.render('auth/olvide',{
              pagina:'Recupera tu acceso a Bienes usuario',
              csrfToken:req.csrfToken(),
              errores:resultado.array()
          });  
      }
      
      // Buscar el usuario

    const {email} = req.body;

    const user= await  Usuario.findOne({where: {email}});

    if(!user){

        return res.render('auth/olvide',{
            pagina:'Recupera tu acceso a Bienes usuario',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El Email no existe registrado a ningún usuario'}]
        });  

    }

    // Generar token y enviar email
    user.token = generarId();

    await user.save();

    // enviar email    
    emailOlvidepassword({
        email: user.email,
        nombre: user.nombre,
        token: user.token
    });
    
    // Mostrar mensaje de configuracion
    res.render('templates/mensaje',{
        pagina: 'Restablece tu Password',
        mensaje: 'Hemos enviado un Email con las instrucciones'

    })
}

const comprobarToken = async (req, res) =>{

    const {token} = req.params;

    const usuario = await Usuario.findOne({where: {token}});
    
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Reestablce tu Password',
            mensaje: 'Hubo un error al validad tu información , intenta de nuevo',
            error:true
        });
    }
    //Mostrar el formulario para modificar el nuevo password

    res.render('auth/reset-password',{
        pagina: 'Reestablece tu password',
        csrfToken:req.csrfToken()
    })

}

const nuevoPassword = async (req,res) =>{
    // validar el password
    await check('password').isLength({ min:6 }).withMessage('El password debe al menos 6 caracteres').run(req);
    
    let resultado = validationResult(req);

    // verificar el resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/reset-password',{
            pagina:'Reestablece tu Password',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        });
    }
    const {token} = req.params; 
    const {password} = req.body;
    //Identificar
    const userupdate = await Usuario.findOne({where: {token}});  
    //Hashear password
    const salt = await bcrypt.genSalt(10);
    userupdate.password= await bcrypt.hashSync(password, salt);
    userupdate.token=null;

    await userupdate.update();

    res.render('auth/confirmar-cuenta',{
        pagina:'Password Reestablecido',
        mensaje : 'El password se guardo correctamente'
    });

}



export { 
    formulariologin,
    formularioregistro,
    formularioolvide,
    save,
    confirmar,
    resetPasword,
    nuevoPassword,
    comprobarToken,
    autenticar,
    cerrarSesion
}