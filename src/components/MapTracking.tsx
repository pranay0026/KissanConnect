"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon issues in Next.js
const iconPerson = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

interface MapTrackingProps {
    pickup: Location;
    drop: Location;
    driver?: Location;
}

// Component to recenter map when props change
function Recenter({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

export default function MapTracking({ pickup, drop, driver }: MapTrackingProps) {
    // Center point calculation
    const centerLat = (pickup.lat + drop.lat) / 2;
    const centerLng = (pickup.lng + drop.lng) / 2;
    const center: [number, number] = [centerLat, centerLng];

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pickup Marker */}
            <Marker position={[pickup.lat, pickup.lng]} icon={iconPerson}>
                <Popup>Pickup: {pickup.address || 'Vendor'}</Popup>
            </Marker>

            {/* Drop Marker */}
            <Marker position={[drop.lat, drop.lng]} icon={iconPerson}>
                <Popup>Drop: {drop.address || 'You'}</Popup>
            </Marker>

            {/* Driver Marker */}
            {driver && (
                <Marker position={[driver.lat, driver.lng]} icon={iconPerson}>
                    <Popup>Delivery Partner</Popup>
                </Marker>
            )}

            {/* Path */}
            <Polyline positions={[
                [pickup.lat, pickup.lng],
                driver ? [driver.lat, driver.lng] : [pickup.lat, pickup.lng],
                [drop.lat, drop.lng]
            ]} color="blue" dashArray="10, 10" />

            <Recenter lat={centerLat} lng={centerLng} />
        </MapContainer>
    );
}
