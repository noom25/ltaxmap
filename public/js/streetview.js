/* ====================== STREET VIEW (Google Maps) ====================== */
/**
 * โหมด Street View — กดปุ่มรูปคน (Pegman) แล้วคลิกจุดบนแผนที่
 * จะเปิดแท็บใหม่ไป Google Maps ในโหมด Street View ณ จุดนั้นทันที
 *
 * หมายเหตุ: วิธีนี้ไม่ต้องใช้ Google Maps API Key
 * เพราะแค่สร้าง URL แล้วเปิดแท็บใหม่ ไม่ได้ฝัง Street View ไว้ในหน้าเว็บ
 * ถ้าจุดที่คลิกไม่มี Street View ครอบคลุม Google จะแจ้งเตือนเอง
 */

let streetViewMode = false;
let streetViewClickHandler = null;

function enableStreetViewMode() {
  if (streetViewMode) return;

  streetViewMode = true;
  const container = map.getContainer();
  container.style.cursor = 'crosshair';

  alert("โหมด Street View 🚶\nคลิกจุดบนแผนที่ที่ต้องการดู Street View\n(คลิกได้แม้บนแปลงที่ดินหรือถนน)");
  console.log("🚶 Street View mode activated");

  streetViewClickHandler = function (e) {
    // ดักจับ click ตั้งแต่ระดับ capture phase (ก่อนที่ Leaflet Canvas
    // จะแย่ง event ไปตอนคลิกโดนแปลงที่ดิน/ถนนที่ render ด้วย preferCanvas)
    e.stopPropagation();

    // แปลงตำแหน่งคลิกบนหน้าจอ ให้เป็นพิกัด lat/lng ของแผนที่โดยตรง
    const latlng = map.mouseEventToLatLng(e);

    const url = `https://www.google.com/maps?layer=c&cbll=${latlng.lat},${latlng.lng}&cbp=11,0,0,0,0`;

    window.open(url, '_blank');
    console.log(`🚶 Opening Street View at: ${latlng.lat}, ${latlng.lng}`);

    disableStreetViewMode();
  };

  // ใช้ addEventListener แบบ native พร้อม capture=true (พารามิเตอร์ตัวสุดท้าย)
  // แทน map.on('click') เพราะ map.on('click') อยู่ใน bubble phase
  // ซึ่ง Canvas renderer ของ Leaflet จะ stopPropagation ก่อนถึงเราเสมอ
  container.addEventListener('click', streetViewClickHandler, true);
}

function disableStreetViewMode() {
  streetViewMode = false;
  map.getContainer().style.cursor = '';

  if (streetViewClickHandler) {
    map.getContainer().removeEventListener('click', streetViewClickHandler, true);
    streetViewClickHandler = null;
  }
}

// ผูกปุ่มเข้ากับฟังก์ชัน (ต้องมี <button id="btnStreetView"> ใน index.html)
const btnStreetView = document.getElementById('btnStreetView');
if (btnStreetView) {
  btnStreetView.addEventListener('click', () => {
    if (streetViewMode) {
      disableStreetViewMode();
    } else {
      enableStreetViewMode();
    }
  });
}

console.log("✅ Street View module loaded");
