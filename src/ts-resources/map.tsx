import React, { RefObject, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl, { EasingOptions, Map as MapboxMap } from 'mapbox-gl';
import clsx from 'clsx';

declare global {
  interface Window {
    DBK_MAPBOX_TOKEN?: string;
  }
}
import {
  useNavigate,
  //useLocation,
  Routes,
  Route,
  BrowserRouter,
  Outlet,
  NavigateFunction,
} from 'react-router-dom';
import { useDisplayMode, useMaxHeight, useToolOutput } from '../shared/open-ai-globals';
import { Hotel } from '../directbooker/types';
import { HotelDescription, HotelPriceButton, HotelRating, HotelTitle } from '../components/hotels';

// Mapbox access token is injected into window.DBK_MAPBOX_TOKEN by the server at render time.

const getRootClasses = (displayMode: string): string =>
  clsx(
    'relative antialiased w-full min-h-[480px] overflow-hidden pt-4',
    displayMode === 'fullscreen'
      ? 'rounded-none border-0'
      : 'border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl'
  );

const getMapWrapperClasses = (displayMode: string): string =>
  clsx(
    'absolute inset-0 overflow-hidden',
    displayMode === 'fullscreen'
      ? 'md:left-[340px] md:right-4 md:top-4 md:bottom-4 border border-black/10 md:rounded-3xl'
      : 'w-full h-full bg-red-200'
  );

const fitMapToMarkers = (map: MapboxMap | null, coords: [number, number][]): void => {
  if (!map || !coords.length) return;
  if (coords.length === 1) {
    // TODO(george): This '||' is annoying but needed to satisfy TS. Find a better way.
    map.flyTo({ center: coords[0] || [0, 0], zoom: 12 });
    return;
  }
  const bounds = coords.reduce(
    (b, c) => b.extend(c),
    new mapboxgl.LngLatBounds(coords[0], coords[0])
  );
  map.fitBounds(bounds, { padding: 60, animate: true });
};

const HotelPopup = (props: { hotel: Hotel }): React.JSX.Element => {
  const { hotel } = props;
  // TODO(george): this duplicates the button. You should make a shared component.
  return (
    <>
      <HotelTitle hotel={hotel} />
      <HotelRating hotel={hotel} />
      <HotelDescription hotel={hotel} />
      <HotelPriceButton hotel={hotel} />
    </>
  );
};

const addAllMarkers = (
  mapObj: RefObject<MapboxMap | null>,
  markerObjs: RefObject<Array<mapboxgl.Marker>>,
  hotelList: Hotel[] | undefined,
  navigate: NavigateFunction,
  displayMode: string
): void => {
  if (!mapObj.current || hotelList == null) return;
  const currentMap = mapObj.current;

  markerObjs.current.forEach(m => m.remove());
  markerObjs.current = [];
  hotelList.forEach(hotel => {
    if (hotel.latitude == null || hotel.longitude == null) return;
    const latlon: [number, number] = [hotel.longitude, hotel.latitude];

    // TODO(george): Make this a function.
    const container = document.createElement('div');
    const root = createRoot(container);
    // onNavigate={navigate}
    root.render(<HotelPopup hotel={hotel} />);
    const popup = new mapboxgl.Popup().setDOMContent(container);
    popup.on('close', () => root.unmount()); // cleanup

    const marker = new mapboxgl.Marker({
      color: '#F46C21',
    })
      .setLngLat(latlon)
      .addTo(currentMap)
      .setPopup(popup); // add popup
    const el = marker.getElement();
    if (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        navigate(`hotel/${hotel.hotel_id}`);
        panTo(mapObj, latlon, { offsetForInspector: true }, displayMode);
      });
    }
    markerObjs.current.push(marker);
  });
};

const getInspectorHalfWidthPx = (displayMode: string): number => {
  if (displayMode !== 'fullscreen') return 0;
  if (typeof window === 'undefined') return 0;
  const isLgUp = window.matchMedia && window.matchMedia('(min-width: 1024px)').matches;
  if (!isLgUp) return 0;
  const el = document.querySelector('.hotel-inspector');
  const w = el ? el.getBoundingClientRect().width : 360;
  return Math.round(w / 2);
};

const panTo = (
  mapObj: RefObject<MapboxMap | null>,
  coord: [number, number],
  { offsetForInspector } = { offsetForInspector: false },
  displayMode: string
): void => {
  if (!mapObj.current) return;
  const halfInspector = offsetForInspector ? getInspectorHalfWidthPx(displayMode) : 0;
  const flyOpts: EasingOptions = {
    center: coord,
    zoom: 14,
    speed: 1.2,
    curve: 1.6,
  };
  if (halfInspector) {
    flyOpts.offset = [-halfInspector, 0];
  }
  mapObj.current.flyTo(flyOpts);
};

const HotelMap = (): React.JSX.Element => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<MapboxMap | null>(null);
  const markerObjs = useRef<Array<mapboxgl.Marker>>([]);
  const displayMode = useDisplayMode();
  const maxHeight = useMaxHeight();
  const navigate: NavigateFunction = useNavigate();

  const toolOutput = useToolOutput();
  const hotels = (toolOutput as { hotels: Array<Hotel> }).hotels as Array<Hotel> | undefined;
  const markerCoords = (hotels || [])
    .map(h => [h.longitude, h.latitude])
    .filter((ll): ll is [number, number] => ll[0] != null && ll[1] != null);
  const mapCenter: [number, number] = markerCoords[0] || [0, 0];

  // TODO(george): 'markers' will be the type from the tool output
  // const markers: { places: Array<{ coords: [number, number] }> } = { places: [] };
  // const places = markers.places;
  // const markerCoords = places.map(p => p.coords);

  useEffect(() => {
    if (mapObj.current || !mapRef.current) return;
    const token = window.DBK_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not configured');
      return;
    }
    mapboxgl.accessToken = token;
    mapObj.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: mapCenter,
      zoom: markerCoords.length > 0 ? 12 : 2,
      attributionControl: false,
    });

    addAllMarkers(mapObj, markerObjs, hotels, navigate, displayMode);
    setTimeout(() => {
      fitMapToMarkers(mapObj.current, markerCoords);
    }, 0);

    // TODO(george): add animation and resizing handling
    // TODO(george): cleanup on unmount
  }, []);

  useEffect(() => {
    if (!mapObj.current) return;
    addAllMarkers(mapObj, markerObjs, hotels, navigate, displayMode);
  }, [hotels, displayMode]);

  // TODO(george): Find a better way to sync the version of the CSS with the version of mapbox-gl.
  return (
    <div
      className={getRootClasses(displayMode)}
    >
      <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css" />
      <Outlet />
      {/* Map */}
      {/* TODO(george): w-full h-full and background color are for debugging. remove them. */}
      <div
        className={getMapWrapperClasses(displayMode)}
      >
        <div
          ref={mapRef}
          className="w-full h-full relative absolute bottom-0 left-0 right-0"
          style={{
            maxHeight: maxHeight ?? undefined,
            height: displayMode === 'fullscreen' ? (maxHeight ?? undefined) : undefined,
          }}
        />
      </div>
    </div>
  );
};

const RouterRoot = (): React.JSX.Element => {
  return (
    <Routes>
      <Route path="*" element={<HotelMap />}>
        <Route path="place/:placeId" element={<></>} />
      </Route>
    </Routes>
  );
};

const map_root = document.getElementById('ts-resource-map');
if (map_root) {
  createRoot(map_root).render(
    <BrowserRouter>
      <RouterRoot />
    </BrowserRouter>
  );
}
