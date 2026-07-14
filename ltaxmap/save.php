<?php
/**
 * LTAX WebGIS - Save Handler
 * 
 * รับข้อมูล GeoJSON และบันทึกลงไฟล์
 * 
 * @version 1.0.0
 */

// ตั้งค่า header
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ตรวจสอบว่าเป็น POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

try {
    // รับข้อมูล JSON
    $json = file_get_contents('php://input');
    
    if (empty($json)) {
        throw new Exception('No data received');
    }
    
    $data = json_decode($json);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    // ตรวจสอบโครงสร้าง GeoJSON
    if (!isset($data->type) || $data->type !== 'FeatureCollection') {
        throw new Exception('Invalid GeoJSON structure');
    }
    
    if (!isset($data->features) || !is_array($data->features)) {
        throw new Exception('Invalid features array');
    }
    
    // กำหนดชื่อไฟล์
    $dataDir = __DIR__ . '/data';
    $filename = $dataDir . '/parcel.geojson';
    $backupDir = $dataDir . '/backups';
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    // สำรองไฟล์เดิม
    if (file_exists($filename)) {
        $backupFile = $backupDir . '/parcel_' . date('Y-m-d_His') . '.geojson';
        copy($filename, $backupFile);
        
        // ลบไฟล์สำรองเก่าที่เกิน 10 ไฟล์
        $backupFiles = glob($backupDir . '/parcel_*.geojson');
        if (count($backupFiles) > 10) {
            usort($backupFiles, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            
            $filesToDelete = array_slice($backupFiles, 0, count($backupFiles) - 10);
            foreach ($filesToDelete as $file) {
                unlink($file);
            }
        }
    }
    
    // บันทึกข้อมูลใหม่
    $jsonString = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $result = file_put_contents($filename, $jsonString);
    
    if ($result === false) {
        throw new Exception('Failed to write file');
    }
    
    // Log การบันทึก
    $logFile = $dataDir . '/save.log';
    $logEntry = sprintf(
        "[%s] Saved %d features (%d bytes) from %s\n",
        date('Y-m-d H:i:s'),
        count($data->features),
        $result,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    );
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    // ส่งผลลัพธ์
    echo json_encode([
        'success' => true,
        'message' => 'บันทึกข้อมูลเรียบร้อย',
        'features' => count($data->features),
        'bytes' => $result,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
    // Log error
    $errorLog = __DIR__ . '/data/error.log';
    $errorEntry = sprintf(
        "[%s] ERROR: %s\n",
        date('Y-m-d H:i:s'),
        $e->getMessage()
    );
    file_put_contents($errorLog, $errorEntry, FILE_APPEND);
}
?>
