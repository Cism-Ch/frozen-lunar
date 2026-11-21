"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinates {
    lat: number;
    lon: number;
}

interface InteractiveLocationMapProps {
    position: Coordinates;
    onSelectPosition: (coords: Coordinates) => void;
}

/**
 * Recentre la carte en douceur lorsque la position sélectionnée change.
 */
function MapViewUpdater({ position }: { position: Coordinates }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([position.lat, position.lon], Math.max(map.getZoom(), 14), {
            duration: 0.6,
        });
    }, [map, position.lat, position.lon]);

    return null;
}

/**
 * Capture les clics sur la carte pour déplacer le marqueur dynamiquement.
 */
function MapClickHandler({
    onSelectPosition,
}: {
    onSelectPosition: (coords: Coordinates) => void;
}) {
    useMapEvents({
        click(event) {
            onSelectPosition({
                lat: event.latlng.lat,
                lon: event.latlng.lng,
            });
        },
    });

    return null;
}

/**
 * Carte interactive OpenStreetMap basée sur Leaflet (SSR-safe via dynamic import).
 * Utilise une icône SVG inline pour éviter les erreurs d'assets statiques avec Next.js.
 */
export function InteractiveLocationMap({
    position,
    onSelectPosition,
}: InteractiveLocationMapProps) {
    const customPinIcon = useMemo(
        () =>
            L.divIcon({
                className: "custom-leaflet-pin",
                html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:hsl(var(--primary, 221 83% 53%));color:#ffffff;box-shadow:0 6px 16px rgba(0,0,0,0.3);border:3px solid #ffffff;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
            }),
        []
    );

    const markerEventHandlers = useMemo(
        () => ({
            dragend(event: L.LeafletEvent) {
                const marker = event.target as L.Marker;
                const latLng = marker.getLatLng();
                onSelectPosition({ lat: latLng.lat, lon: latLng.lng });
            },
        }),
        [onSelectPosition]
    );

    return (
        <div
            className="border-border/60 relative h-[280px] w-full overflow-hidden rounded-xl border sm:h-[360px]"
            aria-label="Carte interactive OpenStreetMap"
        >
            <MapContainer
                center={[position.lat, position.lon]}
                zoom={13}
                scrollWheelZoom
                className="z-0 h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                    position={[position.lat, position.lon]}
                    icon={customPinIcon}
                    draggable
                    eventHandlers={markerEventHandlers}
                />
                <MapClickHandler onSelectPosition={onSelectPosition} />
                <MapViewUpdater position={position} />
            </MapContainer>
        </div>
    );
}
