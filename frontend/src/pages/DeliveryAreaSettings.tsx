import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, Circle, useJsApiLoader } from '@react-google-maps/api';
import { MapPinIcon, RssIcon } from '@heroicons/react/24/outline';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
const DEFAULT_CENTER = { lat: -23.55052, lng: -46.633308 };
const DEFAULT_RADIUS = 5;

export default function DeliveryAreaSettings() {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(DEFAULT_RADIUS); // km
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Geocodifica o endereço para coordenadas
  const geocodeAddress = useCallback(async (addr: string) => {
    if (!window.google || !addr) return;
    setLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: addr }, (results, status) => {
      setLoading(false);
      if (status === 'OK' && results && results[0]) {
        setCenter({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        });
      }
    });
  }, []);

  // Atualiza o mapa ao digitar endereço
  const handleAddressBlur = () => {
    if (address) geocodeAddress(address);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center space-x-3">
        <RssIcon className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold">Área de Entrega</h1>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8 border">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <MapPinIcon className="w-5 h-5 text-primary-500" /> Endereço Base
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onBlur={handleAddressBlur}
              placeholder="Digite o endereço base"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">O endereço será o centro do raio de entrega.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <RssIcon className="w-5 h-5 text-primary-500" /> Raio de Entrega (km)
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              value={radius}
              min={1}
              max={50}
              onChange={e => setRadius(Number(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">Defina o raio máximo de entrega a partir do endereço base.</p>
          </div>
        </form>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors"
            disabled
          >
            Salvar Área de Entrega
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 border">
        <h2 className="text-lg font-semibold mb-2">Visualização no Mapa</h2>
        <div className="w-full h-96 rounded overflow-hidden border">
          {isLoaded ? (
            <GoogleMap
              center={center}
              zoom={13}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              options={{ disableDefaultUI: true }}
              onLoad={map => (mapRef.current = map)}
            >
              <Marker position={center} />
              <Circle
                center={center}
                radius={radius * 1000}
                options={{
                  fillColor: '#6366f1',
                  fillOpacity: 0.15,
                  strokeColor: '#6366f1',
                  strokeOpacity: 0.7,
                  strokeWeight: 2,
                }}
              />
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Carregando mapa...</div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">Digite o endereço e defina o raio para visualizar a área de entrega. O círculo representa o limite máximo de entrega.</p>
      </div>
    </div>
  );
} 