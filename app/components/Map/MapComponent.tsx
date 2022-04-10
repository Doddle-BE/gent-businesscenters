import { useCallback, useRef, useState } from "react";
import Map, { Layer, LayerProps, MapboxGeoJSONFeature, Popup, Source } from "react-map-gl";
import { GeoJSON } from "~/types/types";

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
  const mapRef = useRef<mapboxgl.Map>();

  const [showPopup, setShowPopup] = useState(false);
  const [popupProps, setpopupProps] = useState<MapboxGeoJSONFeature>();

  const onHover = useCallback((event) => {
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
          longitude={3.64776}
          latitude={51.04952}
          anchor="bottom"
          closeButton={false}
        >
          {popupProps?.properties?.naam}
        </Popup>
      )}
    </Map>
  );
};
