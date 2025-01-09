import { useCallback, useRef, useState } from "react";
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

export const MapComponent = ({ geojson, mapboxToken }: Props) => {
  const mapRef = useRef<MapRef>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupProps, setpopupProps] = useState<GeoJSON.Feature | undefined>(
    undefined
  );

  const onHover = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const showMe = mapRef.current?.queryRenderedFeatures(event.point, {
      layers: ["point"],
    });
    if (showMe && showMe.length > 0) {
      setpopupProps(showMe[0]);
      setShowPopup(true);
      return;
    }
    setShowPopup(false);
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: 3.64776,
        latitude: 51.04952,
        zoom: 11,
      }}
      ref={mapRef}
      style={{ width: 1280, height: 720 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={mapboxToken}
      onMouseMove={onHover}
    >
      <Source id="my-data" type="geojson" data={geojson}>
        <Layer {...layerStyle} />
      </Source>
      {showPopup && (
        <Popup
          longitude={(popupProps?.geometry as GeoJSON.Point)?.coordinates?.[0]}
          latitude={(popupProps?.geometry as GeoJSON.Point)?.coordinates?.[1]}
          anchor="bottom"
          closeButton={false}
          style={{
            color: "blue",
          }}
        >
          {popupProps?.properties?.naam}
        </Popup>
      )}
    </Map>
  );
};
