const esVandedor = (ususarioId, propiedadUsuarioId) =>{
     return ususarioId === propiedadUsuarioId
}

const formatearFecha = fecha =>{

    const nuevaFecha = new Date(fecha).toISOString().slice(0,10)

    const opciones = {
        weekkday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return new Date(nuevaFecha).toLocaleDateString('es-ES',opciones)


}


export{
    esVandedor,
    formatearFecha
} 