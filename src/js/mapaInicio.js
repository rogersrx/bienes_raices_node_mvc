(function(){

    const lat =  -12.1510961;
    const lng =  -76.9639313;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 13);
    
    let markers = new L.FeatureGroup().addTo(mapa);
    let propiedades = []

    //filtros
    const filtros ={
        categoria:'',
        precio:''
    }

    

    const categoriaSelect = document.querySelector('#categorias');
    const precioSelect = document.querySelector('#precios');

     // Utilizar el Provider y Geocoder       

     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(mapa);


     categoriaSelect.addEventListener('change', e =>{
        filtros.categoria=e.target.value

        filtrarPropiedades()


     })

     precioSelect.addEventListener('change', e =>{
        filtros.precio=e.target.value
        filtrarPropiedades()
     })



     const obtenerPropiedades = async () =>{

        try{

            const url = '/api/propiedades'

            const resp = await fetch(url)
            propiedades  = await resp.json()

            mostrarPropiedades(propiedades)

        }catch(error){
            console.log(error)


        }
     }

     

     const mostrarPropiedades = propiedades =>{

        //limpiar los markets previos 
        markers.clearLayers()

        propiedades.forEach(propiedad =>{
            const marker = new L.marker([propiedad?.lat,propiedad?.lng],{
                autoPan:true
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre} </p>
                <h1 class ="text-xl font-extrabold uppercase my-3" >${propiedad.titulo}</h1>
                <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propiedad ${propiedad.titulo}">
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre} </p>
                <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase"> Ver Propiedad </a>
                
                `)

            markers.addLayer(marker)
        })

     }

    const filtrarPropiedades = () =>{        
        const resp = propiedades.filter( filtrarCategoria ).filter( filtrarPrecio )       
        mostrarPropiedades(resp)
    }

    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === Number(filtros.categoria) : propiedad

    const filtrarPrecio    = propiedad => filtros.precio ? propiedad.precioId === Number(filtros.precio) : propiedad   

     obtenerPropiedades()

})()