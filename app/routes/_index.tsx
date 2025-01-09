import { Form, redirect } from "react-router";
import BusinessType from "~/components/BusinessType/BusinessType";
import { MapComponent } from "~/components/Map/MapComponent";
import type { Feature, GeoJSON, SelectData } from "~/types/types";
import type { Route } from "./+types/_index";
import "mapbox-gl/dist/mapbox-gl.css";

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

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const selectedType = url.searchParams.get("type") || "all";

  if (!selectedType) {
    return redirect("/?type=all");
  }

  const mapboxToken = process.env.MAPBOX_TOKEN;
  if (!mapboxToken) {
    throw new Error("MAPBOX_TOKEN environment variable is required");
  }

  const geojson: GeoJSON = await (
    await fetch(`${url.origin}/bedrijvencentra-gent.geojson`)
  ).json();

  const filteredGeojson: GeoJSON =
    selectedType === "all"
      ? geojson
      : {
          type: "FeatureCollection",
          features: geojson.features.filter(
            (f: Feature) =>
              f.properties.type.toLowerCase() === selectedType.toLowerCase()
          ),
        };

  return { geojson, filteredGeojson, mapboxToken, selectedType };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData();
  return redirect(`/?type=${data.get("businessType")}`);
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { geojson, filteredGeojson, mapboxToken, selectedType } = loaderData;
  const selectData = filterUniqueBusinessTypes(geojson);

  return (
    <div className="min-h-screen p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Locaties bedrijvencentra Gent</h1>
      <Form method="post" className="mb-4">
        <BusinessType selectData={selectData} selectedType={selectedType} />
      </Form>
      <MapComponent
        geojson={filteredGeojson as GeoJSON.FeatureCollection}
        mapboxToken={mapboxToken}
      />
    </div>
  );
}
