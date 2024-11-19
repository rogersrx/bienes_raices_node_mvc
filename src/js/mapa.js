(function() {

    

    const lat = document.querySelector('#lat').value || -12.1510961;
    const lng = document.querySelector('#lng').value || -76.9639313;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;

    // Utilizar el Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
       

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // El Pin
    marker = new L.marker([lat, lng],{
        draggable:true,
        autoPan: true
    })
    .addTo(mapa)

    // Detectar el movimiento del pin
    marker.on('moveend', function(e){
        marker= e.target;
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))

        // Obtener las informaciones de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion,13).run(function(error,resp){
           // console.log(resp);
           marker.bindPopup(resp.address.LongLabel);

            // llenar los campos
            document.querySelector('.calle').textContent = resp?.address?.Address ?? '';
            document.querySelector('#calle').value = resp?.address?.Address ?? '';
            document.querySelector('#lat').value = resp?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resp?.latlng?.lng ?? '';

        });
    })






})()