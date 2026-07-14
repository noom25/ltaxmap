// netlify/functions/load.js
import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const store = getStore("parcel-data");
    const geojson = await store.get("parcel.geojson", { type: "json" });

    if (!geojson) {
      return new Response(JSON.stringify({ error: "ไม่พบข้อมูล" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(geojson), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "โหลดข้อมูลล้มเหลว: " + err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
