import "mapbox-gl/dist/mapbox-gl.css";
import { Form, redirect } from "react-router";
import { MapComponent } from "~/components/Map/MapComponent";
import type { Feature, GeoJSON, SelectData } from "~/types/types";
import type { Route } from "./+types/_index";
import BusinessType from "~/components/BusinessType/BusinessType";

function convertToFeatureCollection(
  locations: any[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: locations.map((location) => ({
      type: "Feature",
      geometry: {
        ...location.geometry.geometry,
      },
      properties: {
        type: location.type,
        geo_point_2d: [location.geo_point_2d.lat, location.geo_point_2d.lon],
        globalid: location.globalid,
        gentid: location.gentid,
        huisnr: location.huisnr,
        naam: location.naam,
        straat: location.straat,
        url: location.url,
      },
    })),
  };
}

const filterUniqueBusinessTypes = (geojson: GeoJSON.FeatureCollection) => {
  const uniqueIds: Array<string> = [];

  return geojson.features
    .map((feature: GeoJSON.Feature) => {
      return {
        name: feature?.properties?.type,
        count: geojson.features.filter(
          (f: GeoJSON.Feature) =>
            f.properties?.type === feature.properties?.type
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

  try {
    const response = await fetch(
      "https://data.stad.gent/api/explore/v2.1/catalog/datasets/bedrijvencentra-gent/records?limit=50"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const locations: any[] = data.results;

    const geojson = convertToFeatureCollection(locations);

    const filteredGeojson =
      selectedType === "all"
        ? geojson
        : {
            ...geojson,
            features: geojson.features.filter(
              (feature) =>
                (feature?.properties?.type as string).toLowerCase() ===
                selectedType.toLowerCase()
            ),
          };

    return { geojson, filteredGeojson, mapboxToken, selectedType };
  } catch (error) {
    throw new Error(
      `Failed to fetch business locations: ${(error as Error).message}`
    );
  }
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
