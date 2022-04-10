export interface GeoJSON {
    type: string
    features: Feature[]
  }
  
  export interface Feature {
    type: string
    geometry: Geometry
    properties: Properties
  }
  
  export interface Geometry {
    coordinates: number[]
    type: string
  }
  
  export interface Properties {
    type: string
    geo_point_2d: number[]
    globalid: string
    gentid?: string
    huisnr: string
    naam: string
    straat: string
    url: string
  }

  export interface SelectData {
    name: string;
    count: number;
  }