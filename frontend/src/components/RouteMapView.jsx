import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle, Loader } from 'lucide-react';

const geocodeLocation = async (locationName) => {
  if (!locationName?.trim()) return null;
  try {
    const encoded = encodeURIComponent(locationName);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'bs,hr,sr,en' } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
};

const STATUS_COLORS = {
  'Planirano':   '#0ea5e9',
  'Rezervisano': '#8b5cf6',
  'Završeno':    '#10b981',
  'Otkazano':    '#f43f5e',
};

const RouteMapView = ({ activities }) => {
  const mapRef       = useRef(null);
  const leafletRef   = useRef(null);
  const markersRef   = useRef([]);
  const polylinesRef = useRef([]);

  const [geocoding, setGeocoding] = useState(false);
  const [geocoded,  setGeocoded]  = useState([]);
  const [geoError,  setGeoError]  = useState('');
  const [mapReady,  setMapReady]  = useState(false);

  const relevant = activities.filter(a => a.location?.trim());

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [44.0, 17.0],
        zoom: 6,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = { map, L };
      setMapReady(true);
    }).catch(() => {
      setGeoError('Greška pri učitavanju mape. Pokrenite: npm install leaflet');
    });

    return () => {
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!relevant.length) { setGeocoded([]); return; }

    setGeocoding(true);
    setGeoError('');

    const geocodeAll = async () => {
      const results = [];
      for (const act of relevant) {
        const coords = await geocodeLocation(act.location);
        results.push({ act, coords });
        await new Promise(r => setTimeout(r, 1100));
      }
      return results;
    };

    geocodeAll()
      .then(results => {
        const found = results.filter(r => r.coords !== null);
        setGeocoded(found);
        if (!found.length && relevant.length) {
          setGeoError(
            'Nisu pronađene koordinate za unesene lokacije. ' +
            'Unesite puni naziv lokacije, npr. "Eiffelov toranj, Pariz, Francuska".'
          );
        }
      })
      .catch(() => setGeoError('Greška pri dohvatanju koordinata.'))
      .finally(() => setGeocoding(false));

  }, [JSON.stringify(relevant.map(a => a.id + a.location))]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !geocoded.length) return;

    const { map, L } = leafletRef.current;

    markersRef.current.forEach(m => m.remove());
    polylinesRef.current.forEach(p => p.remove());
    markersRef.current   = [];
    polylinesRef.current = [];

    const latlngs = [];

    geocoded.forEach(({ act, coords }, index) => {
      const color = STATUS_COLORS[act.status] || '#64748b';

      const svgIcon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:44px">
          <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg"
               style="width:36px;height:44px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">
            <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z"
                  fill="${color}"/>
            <circle cx="18" cy="18" r="10" fill="white"/>
            <text x="18" y="23" text-anchor="middle" font-size="11"
                  font-weight="700" fill="${color}" font-family="system-ui">${index + 1}</text>
          </svg></div>`,
        iconSize:    [36, 44],
        iconAnchor:  [18, 44],
        popupAnchor: [0, -44],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: svgIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui;min-width:180px;padding:4px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${index + 1}. ${act.name}</div>
            <div style="color:${color};font-size:11px;font-weight:600;margin-bottom:4px">${act.status}</div>
            ${act.time ? `<div style="font-size:12px;color:#64748b">🕐 ${act.time}</div>` : ''}
            <div style="font-size:12px;color:#64748b">📍 ${act.location}</div>
            ${act.estimatedCost > 0 ? `<div style="font-size:12px;color:#059669;margin-top:4px">💰 ${act.estimatedCost} €</div>` : ''}
          </div>`, { maxWidth: 240 });

      markersRef.current.push(marker);
      latlngs.push([coords.lat, coords.lng]);
    });

    if (latlngs.length > 1) {
      const poly = L.polyline(latlngs, {
        color: '#1E3A5F', weight: 3, opacity: 0.75,
        dashArray: '8, 6', lineCap: 'round',
      }).addTo(map);
      polylinesRef.current.push(poly);

      for (let i = 0; i < latlngs.length - 1; i++) {
        const mid = [
          (latlngs[i][0] + latlngs[i + 1][0]) / 2,
          (latlngs[i][1] + latlngs[i + 1][1]) / 2,
        ];
        const arrow = L.marker(mid, {
          icon: L.divIcon({
            className: '',
            html: `<div style="color:#1E3A5F;font-size:16px;font-weight:bold">→</div>`,
            iconSize: [16, 16], iconAnchor: [8, 8],
          }),
          interactive: false,
        }).addTo(map);
        markersRef.current.push(arrow);
      }
    }

    if (latlngs.length === 1) {
      map.setView(latlngs[0], 13);
    } else if (latlngs.length > 1) {
      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
    }
  }, [geocoded, mapReady]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Navigation className="w-4 h-4 text-primary-500" />
          <span className="font-medium">Ruta kretanja</span>
          {geocoding && (
            <span className="flex items-center gap-1 text-xs text-sky-600">
              <Loader className="w-3 h-3 animate-spin" />
              Pronalaženje koordinata...
            </span>
          )}
        </div>
        {geocoded.length > 0 && (
          <span className="badge-neutral text-xs">
            {geocoded.length} od {relevant.length} lokacija pronađeno
          </span>
        )}
      </div>

      {!relevant.length && (
        <div className="card">
          <div className="empty-state py-8">
            <MapPin className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">
              Nema aktivnosti s unesenom lokacijom. Dodajte lokaciju aktivnostima da vidite rutu na mapi.
            </p>
          </div>
        </div>
      )}

      {geoError && (
        <div className="alert-error text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{geoError}
        </div>
      )}

      <div
        ref={mapRef}
        style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}
        className="shadow-card"
      />

      {geocoded.length > 0 && (
        <div className="card-sm">
          <p className="text-xs font-semibold text-slate-600 mb-2">Redoslijed obilaska:</p>
          <div className="space-y-1.5">
            {geocoded.map(({ act }, i) => (
              <div key={act.id} className="flex items-center gap-2.5 text-xs">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[act.status] || '#64748b', fontSize: '10px' }}
                >
                  {i + 1}
                </div>
                <span className="font-medium text-slate-700">{act.name}</span>
                {act.time && <span className="text-slate-400">{act.time}</span>}
                <span className="text-slate-400 truncate">— {act.location}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
            Mapa koristi OpenStreetMap · Koordinate via Nominatim
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteMapView;
