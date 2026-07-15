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

    // ลบ backup เก่าที่เกิน 30 วัน ออกอัตโนมัติ กันข้อมูลสะสมจนหนัก
    const RETENTION_DAYS = 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    try {
      const { blobs } = await store.list({ prefix: "backup-" });
      for (const blob of blobs) {
        // ดึงวันที่จากชื่อไฟล์ เช่น "backup-2026-06-01.geojson" -> "2026-06-01"
        const match = blob.key.match(/^backup-(\d{4}-\d{2}-\d{2})\.geojson$/);
        if (!match) continue;

        const blobDate = new Date(match[1]);
        if (blobDate < cutoff) {
          await store.delete(blob.key);
          console.log(`🗑️ ลบ backup เก่า: ${blob.key}`);
        }
      }
    } catch (cleanupErr) {
      // ถ้าลบ backup เก่าไม่สำเร็จ ไม่ต้องทำให้การบันทึกหลักล้มเหลวไปด้วย
      console.warn("⚠️ ลบ backup เก่าไม่สำเร็จ:", cleanupErr.message);
    }

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
