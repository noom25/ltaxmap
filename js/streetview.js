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
  map.getContainer().style.cursor = 'crosshair';

  alert("โหมด Street View 🚶\nคลิกจุดบนแผนที่ที่ต้องการดู Street View");
  console.log("🚶 Street View mode activated");

  streetViewClickHandler = function (e) {
    const { lat, lng } = e.latlng;

    // สร้าง URL เปิด Google Street View ตรงพิกัดที่คลิก
    const url = `https://www.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0`;

    window.open(url, '_blank');
    console.log(`🚶 Opening Street View at: ${lat}, ${lng}`);

    disableStreetViewMode();
  };

  map.on('click', streetViewClickHandler);
}

function disableStreetViewMode() {
  streetViewMode = false;
  map.getContainer().style.cursor = '';

  if (streetViewClickHandler) {
    map.off('click', streetViewClickHandler);
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
