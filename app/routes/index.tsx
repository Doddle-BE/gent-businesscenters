import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import BusinessType from "~/components/BusinessType/BusinessType";
import { MapComponent } from "~/components/Map/MapComponent";
import { GeoJSON, Feature, SelectData } from "~/types/types";
import styles from "mapbox-gl/dist/mapbox-gl.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

const filterUniqueBusinessTypes = (geojson: GeoJSON) => {
  const uniqueIds: Array<string> = [];

  return geojson.features
    .map((feature: Feature) => {
      return {
        name: feature.properties.type,
        count: geojson.features.filter(
          (f: Feature) => f.properties.type === feature.properties.type
        ).length,
      };
    })
    .filter((feature: SelectData) => {
      const isDuplicate = uniqueIds.includes(feature.name);

      if (!isDuplicate) {
        uniqueIds.push(feature.name);

        return true;
      }
      return false;
    });
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (!url.searchParams.get("type")) return redirect(`/?type=all`);

  const mapboxToken = `${process.env.MAPBOX_TOKEN}`;
  const selectedType = url.searchParams.get("type");
  const geojson: GeoJSON = await (
    await fetch(`${url.origin}/bedrijvencentra-gent.geojson`)
  ).json();
  const filteredGeojson: GeoJSON =
    selectedType === "all"
      ? geojson
      : {
          type: "FeatureCollection",
          features: geojson.features.filter((f: Feature) => {
            if (f.properties.type.toLowerCase() === selectedType) {
              return true;
            }
            return false;
          }),
        };

  return { geojson, filteredGeojson, mapboxToken };
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  return redirect(`/?type=${data.get("businessType")}`);
};

export default function Index() {
  const [searchParams] = useSearchParams();
  const { geojson, filteredGeojson, mapboxToken } = useLoaderData();
  const selectData = filterUniqueBusinessTypes(geojson);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Locaties bedrijvencentra Gent</h1>
      <Form method="post">
        <BusinessType
          selectData={selectData}
          selectedType={searchParams.get("type") || "all"}
        />
        <MapComponent geojson={filteredGeojson} mapboxToken={mapboxToken} />
      </Form>
    </div>
  );
}
