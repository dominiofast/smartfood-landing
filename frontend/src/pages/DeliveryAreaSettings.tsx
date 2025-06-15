import React, { useState } from 'react';

export default function DeliveryAreaSettings() {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(5); // km

  // Para exibir o mapa, pode-se usar um iframe do Google Maps para visualização simples
  // Em produção, recomenda-se usar uma lib como @react-google-maps/api
  const mapSrc = address
    ? `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_MAPS_API_KEY&center=-23.55052,-46.633308&zoom=10`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Área de Entrega</h1>
      <form className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Endereço Base</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Digite o endereço base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Raio de Entrega (km)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={radius}
            min={1}
            max={50}
            onChange={e => setRadius(Number(e.target.value))}
          />
        </div>
      </form>
      <div className="w-full h-96 rounded overflow-hidden border">
        <iframe
          title="Mapa de Entrega"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={mapSrc}
          allowFullScreen
        ></iframe>
      </div>
      <p className="mt-2 text-sm text-gray-500">O círculo do raio será exibido no mapa ao integrar a API do Google Maps.</p>
    </div>
  );
} 