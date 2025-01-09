import { useCallback, useEffect, useRef, useState } from "react";
import Map, {
  Layer,
  type LayerProps,
  type MapRef,
  Popup,
  Source,
} from "react-map-gl";

type Props = {
  geojson: GeoJSON.FeatureCollection;
  mapboxToken: string;
};

const layerStyle: LayerProps = {
  id: "point",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": "#000281",
  },
};

// Center on Ghent
const INITIAL_VIEW_STATE = {
  longitude: 3.725,
  latitude: 51.0543,
  zoom: 12,
  bearing: 0,
  pitch: 0,
};

export const MapComponent = ({ geojson, mapboxToken }: Props) => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    name: string;
  } | null>(null);

  const onHover = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ["point"],
    });

    if (features.length > 0) {
      const feature = features[0];
      const geometry = feature.geometry as GeoJSON.Point;

      if (geometry?.coordinates) {
        setPopupInfo({
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
          name: feature.properties?.naam || "",
        });
        setShowPopup(true);
      }
    } else {
      setShowPopup(false);
      setPopupInfo(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setShowPopup(false);
    setPopupInfo(null);
  }, []);

  return (
    <div className="w-full h-[720px] rounded-lg overflow-hidden border border-gray-200">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={mapboxToken}
        onMouseMove={onHover}
        onMouseLeave={onMouseLeave}
        interactiveLayerIds={["point"]}
      >
        <Source id="my-data" type="geojson" data={geojson}>
          <Layer {...layerStyle} />
        </Source>
        {showPopup && popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
          >
            <div className="bg-white text-gray-900 px-2 py-1">
              <p className="text-sm font-medium">{popupInfo.name}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
