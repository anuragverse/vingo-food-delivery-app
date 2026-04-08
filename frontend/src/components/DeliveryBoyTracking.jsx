import React, { useEffect, useState } from 'react'
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
})

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
})

function FitBounds({ routeCoordinates }) {
  const map = useMap()

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      map.fitBounds(routeCoordinates, { padding: [50, 50] })
    }
  }, [routeCoordinates, map])

  return null
}

function DeliveryBoyTracking({ data }) {
  const [routeCoordinates, setRouteCoordinates] = useState([])

  const deliveryBoyLat = data?.deliveryBoyLocation?.lat
  const deliveryBoylon = data?.deliveryBoyLocation?.lon
  const customerLat = data?.customerLocation?.lat
  const customerlon = data?.customerLocation?.lon

  const center = [deliveryBoyLat, deliveryBoylon]

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        if (
          !deliveryBoyLat ||
          !deliveryBoylon ||
          !customerLat ||
          !customerlon
        ) return

        const url = `https://router.project-osrm.org/route/v1/driving/${deliveryBoylon},${deliveryBoyLat};${customerlon},${customerLat}?overview=full&geometries=geojson`

        const response = await fetch(url)
        const result = await response.json()

        if (result.routes && result.routes.length > 0) {
          const coords = result.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          )
          setRouteCoordinates(coords)
        }
      } catch (error) {
        console.log("ROUTE FETCH ERROR:", error)
      }
    }

    fetchRoute()
  }, [deliveryBoyLat, deliveryBoylon, customerLat, customerlon])

  if (!deliveryBoyLat || !deliveryBoylon || !customerLat || !customerlon) {
    return (
      <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-gray-100'>
        <p className='text-gray-500'>Tracking data not available</p>
      </div>
    )
  }

  return (
    <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
      <MapContainer
        className="w-full h-full"
        center={center}
        zoom={16}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[deliveryBoyLat, deliveryBoylon]} icon={deliveryBoyIcon}>
          <Popup>Delivery Boy</Popup>
        </Marker>

        <Marker position={[customerLat, customerlon]} icon={customerIcon}>
          <Popup>Customer Location</Popup>
        </Marker>

        {routeCoordinates.length > 0 && (
          <>
            <Polyline positions={routeCoordinates} color='blue' weight={5} />
            <FitBounds routeCoordinates={routeCoordinates} />
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default DeliveryBoyTracking