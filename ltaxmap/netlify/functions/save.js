// netlify/functions/save.js
import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // อนุญาตเฉพาะ POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const geojson = await req.json();

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!geojson || !geojson.features) {
      return new Response(
        JSON.stringify({ error: "ข้อมูล GeoJSON ไม่ถูกต้อง" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // เก็บลง Netlify Blobs (key-value storage แบบถาวร)
    const store = getStore("parcel-data");
    await store.setJSON("parcel.geojson", geojson);

    // เก็บ backup แยกตามวันที่ (กันเผื่อบันทึกทับผิด)
    const today = new Date().toISOString().split("T")[0];
    await store.setJSON(`backup-${today}.geojson`, geojson);

    return new Response(
      JSON.stringify({
        message: "✅ บันทึกเรียบร้อย",
        count: geojson.features.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "บันทึกล้มเหลว: " + err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
