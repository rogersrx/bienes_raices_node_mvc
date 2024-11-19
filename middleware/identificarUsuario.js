import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'


const indentificarUsuario = async (req, res, next) =>{
    // Identifcar si hay un token
    const { _token } = req.cookies
    if( !_token ){
        req.usuario = null
        return next()
    }
    //Comprobar el token
    try{        
        const decoded = jwt.verify(_token,process.env.JWT_SECRET)
        console.log(decoded.id)
        const usuario = await Usuario.scope('elimnarPassword').findByPk(decoded.id)

        if(usuario){
            req.usuario = usuario
        } else {
            return res.redirect('/auth/login')
        }

        return next()        
    } catch (error){
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }

}

export default indentificarUsuario