import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Loader2, MapPin, Search } from 'lucide-react';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapComponent({ position, setPosition, onLocationChange }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function AddressMapPicker({ onClose, onSave }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressLabel, setAddressLabel] = useState('Home');

  const defaultCenter = [28.6139, 77.2090]; // New Delhi, India

  useEffect(() => {
    handleLocateMe();
  }, []);

  const handleLocateMe = () => {
    setLoading(true);
    setError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          fetchAddress(latitude, longitude);
        },
        (err) => {
          setLoading(false);
          setError('Failed to get location. Please allow location access or pick manually on the map.');
          setPosition(defaultCenter);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoading(false);
      setError('Geolocation is not supported by your browser.');
      setPosition(defaultCenter);
    }
  };

  const fetchAddress = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (res.data && res.data.display_name) {
        setAddress(res.data.display_name);
      } else {
        setAddress('Address not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch address details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (lat, lng) => {
    fetchAddress(lat, lng);
  };

  const handleSave = () => {
    if (!address) {
      setError('Please select a valid location.');
      return;
    }
    onSave({
      id: `addr-${Date.now()}`,
      label: addressLabel,
      details: address,
      lat: position?.[0],
      lng: position?.[1],
      isPrimary: false
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-serif font-bold text-[#002F24] text-lg">Add Delivery Address</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-none text-xl cursor-pointer px-2">
            &times;
          </button>
        </div>

        {/* Map Area */}
        <div className="relative h-64 w-full bg-gray-100">
          {(position || !loading) && (
            <MapContainer center={position || defaultCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapComponent position={position} setPosition={setPosition} onLocationChange={handleLocationChange} />
            </MapContainer>
          )}

          <div className="absolute top-4 right-4 z-[20]">
            <button 
              onClick={handleLocateMe}
              className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-bold text-[#002F24] flex items-center gap-2 hover:bg-gray-50 border border-gray-200 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              Locate Me
            </button>
          </div>
        </div>

        {/* Details Area */}
        <div className="p-6 bg-white overflow-y-auto">
          {error && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Detected Address</label>
              <div className="relative">
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#FAF6EC] border border-gray-200 outline-none rounded-xl py-2 px-3 text-sm text-[#002F24] min-h-[60px] resize-none"
                  placeholder="Move the marker on the map to detect address or type manually..."
                />
                {loading && (
                  <div className="absolute top-3 right-3 text-[#D4AF37]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Save Address As</label>
              <div className="flex gap-3">
                {['Home', 'Office', 'Other'].map(lbl => (
                  <button
                    key={lbl}
                    onClick={() => setAddressLabel(lbl)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      addressLabel === lbl 
                        ? 'bg-[#002F24] text-white border-[#002F24]' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!address || loading}
            className="px-5 py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Address
          </button>
        </div>

      </div>
    </div>
  );
}
