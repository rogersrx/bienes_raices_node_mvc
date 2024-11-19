import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'juan',
        email: 'roger@gamil.com',
        confirmado: 1,
        password: bcrypt.hashSync('123456', 10)
    },
    {
        nombre: 'roger',
        email: 'juan@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('123456', 10)
    }
]

export default usuarios