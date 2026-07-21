#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Pastikan install library ArduinoJson by Benoit Blanchon
#include <DHT.h>         // Pastikan install library DHT sensor library by Adafruit
#include <SPI.h>
#include <SD.h>

// ==========================================
// [TINYML STEP 1] INCLUDE LIBRARY AI ANDA
// ==========================================
// Jika pakai Edge Impulse, Anda akan meng-include library-nya di sini:
// #include <scentinel_pkmkc_inferencing.h> 


// ==========================================
// 1. MODE OPERASI (PENTING UNTUK TINYML!)
// ==========================================
// Ubah menjadi 'true' saat sedang mengambil dataset ke laptop (via Serial).
// Ubah menjadi 'false' jika model AI sudah dimasukkan dan ingin mengirim hasil ke Website.
#define DATA_COLLECTION_MODE false 

// ==========================================
// 2. KONFIGURASI JARINGAN & SERVER
// ==========================================
const char* ssid = "NAMA_WIFI_KAMU";
const char* password = "PASSWORD_WIFI";

// Ganti IP dengan IP Address laptop/server tempat backend jalan (dapat dilihat dengan perintah `ip a` atau `ipconfig`)
const char* serverUrl = "http://192.168.1.XXX:8080/api/readings/"; 
const char* apiKey = "scentinel_esp32_secret_key_123"; // Samakan dengan ESP32_API_KEY di .env backend

// ==========================================
// 3. KONFIGURASI PIN SENSOR ESP32
// ==========================================
#define MQ3_PIN 34     // Pin analog untuk MQ-3 (Alkohol)
#define MQ4_PIN 35     // Pin analog untuk MQ-4 (Metana)
#define MQ135_PIN 32   // Pin analog untuk MQ-135 (VOC/Udara)
#define TGS2602_PIN 33 // Pin analog untuk TGS-2602
#define DHT_PIN 4      // Pin digital untuk DHT22
#define DHT_TYPE DHT22

#define SD_CS_PIN 5    // Pin Chip Select untuk modul SD Card

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Inisialisasi SD Card
  if (!SD.begin(SD_CS_PIN)) {
    Serial.println("Peringatan: Gagal inisialisasi SD Card! Pastikan kabel terhubung.");
  } else {
    Serial.println("SD Card berhasil diinisialisasi.");
  }
  
  // Connect to Wi-Fi (Hanya jika bukan mode koleksi data)
  if (!DATA_COLLECTION_MODE) {
    WiFi.begin(ssid, password);
    Serial.print("Menghubungkan ke WiFi");
    while(WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\nBerhasil terhubung ke WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    // Header CSV untuk dataset
    Serial.println("timestamp,mq3,mq4,mq135,tgs2602,temperature,humidity,label");
  }
}

void loop() {
  // ------------------------------------------
  // BACA DATA SENSOR
  // ------------------------------------------
  float mq3_val = analogRead(MQ3_PIN);
  float mq4_val = analogRead(MQ4_PIN);
  float mq135_val = analogRead(MQ135_PIN);
  float tgs2602_val = analogRead(TGS2602_PIN);
  
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (isnan(temp) || isnan(hum)) {
    if (!DATA_COLLECTION_MODE) Serial.println("Gagal membaca dari sensor DHT!");
    temp = 0.0; 
    hum = 0.0;
  }

  // ------------------------------------------
  // ALUR 1: MODE PENGAMBILAN DATA (DATASET)
  // ------------------------------------------
  if (DATA_COLLECTION_MODE) {
    // Cetak format CSV (Bisa ditangkap aplikasi seperti PuTTY / Edge Impulse CLI)
    // Label silakan diganti manual sesuai sampel yang sedang diuji, misal "LAYAK" atau "BUSUK"
    String label = "LAYAK"; 
    
    Serial.print(millis()); Serial.print(",");
    Serial.print(mq3_val); Serial.print(",");
    Serial.print(mq4_val); Serial.print(",");
    Serial.print(mq135_val); Serial.print(",");
    Serial.print(tgs2602_val); Serial.print(",");
    Serial.print(temp); Serial.print(",");
    Serial.print(hum); Serial.print(",");
    Serial.println(label);
    
    delay(1000); // Ambil data tiap 1 detik saat koleksi dataset
    return;      // Skip kode di bawah
  }

  // ------------------------------------------
  // ALUR 2: MODE PRODUKSI (KIRIM KE WEB ATAU SD CARD)
  // ------------------------------------------

  // ------------------------------------------
  // 4. INFERENSI AI (TINYML / EDGE IMPULSE)
  // ------------------------------------------
  String prediction = "LAYAK";
  float confidence = 0.0;

  /*
  // ==========================================
  // [TINYML STEP 2] MASUKKAN ARRAY FITUR
  // ==========================================
  // Array ini berisi semua nilai mentah dari sensor yang baru dibaca
  float features[6] = {mq3_val, mq4_val, mq135_val, tgs2602_val, temp, hum};
  
  // Convert ke format Edge Impulse signal
  signal_t features_signal;
  int err = numpy::signal_from_buffer(features, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &features_signal);
  
  // ==========================================
  // [TINYML STEP 3] JALANKAN KLASIFIKASI (RUN INFERENCE)
  // ==========================================
  ei_impulse_result_t result = { 0 };
  err = run_classifier(&features_signal, &result, false);
  
  if (err == EI_IMPULSE_OK) {
      // Asumsi label index 0 = "LAYAK", index 1 = "TIDAK LAYAK"
      if (result.classification[0].value > result.classification[1].value) {
          prediction = "LAYAK";
          confidence = result.classification[0].value;
      } else {
          prediction = "TIDAK LAYAK";
          confidence = result.classification[1].value;
      }
  }
  */
  
  // ==========================================
  // (SEMENTARA) Logika Simulasi AI Edge 
  // ==========================================
  // Hapus bagian ini nanti saat kode TinyML di atas sudah diaktifkan.
  if (mq3_val > 1500 || mq4_val > 2000) {
    prediction = "TIDAK LAYAK";
    confidence = 0.85;
  } else {
    prediction = "LAYAK";
    confidence = 0.98;
  }
  
  // ------------------------------------------
  // 5. BUAT JSON PAYLOAD
  // ------------------------------------------
  // Harus sama persis dengan skema backend (Pydantic / schemas/reading.py)
  StaticJsonDocument<300> doc;
  doc["device_id"] = 1; // Sekarang kita sudah fix ke arsitektur single-device
  doc["mq3"] = mq3_val;
  doc["mq4"] = mq4_val;
  doc["mq135"] = mq135_val;
  doc["tgs2602"] = tgs2602_val;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["prediction"] = prediction;
  doc["confidence"] = confidence;
  
  // Payload untuk Live Data
  doc["is_syncing"] = false;
  String payloadLive;
  serializeJson(doc, payloadLive);

  // Payload untuk Sinkronisasi SD Card
  doc["is_syncing"] = true;
  String payloadOffline;
  serializeJson(doc, payloadOffline);

  // ------------------------------------------
  // 6. TENTUKAN PENGIRIMAN: WIFI ONLINE ATAU SD CARD OFFLINE
  // ------------------------------------------
  if (WiFi.status() == WL_CONNECTED) {
    // --- Cek & Kirim Data Offline (Sinkronisasi) ---
    if (SD.exists("/offline_data.txt")) {
      Serial.println("Ditemukan data offline. Memulai sinkronisasi...");
      File file = SD.open("/offline_data.txt", FILE_READ);
      File tempFile = SD.open("/temp_data.txt", FILE_WRITE);

      if (file && tempFile) {
        while (file.available()) {
          String offlinePayload = file.readStringUntil('\n');
          offlinePayload.trim();
          
          if (offlinePayload.length() > 0) {
            HTTPClient httpOffline;
            httpOffline.begin(serverUrl);
            httpOffline.addHeader("Content-Type", "application/json");
            httpOffline.addHeader("X-API-Key", apiKey);
            
            int httpResponseCode = httpOffline.POST(offlinePayload);
            if (httpResponseCode > 0) {
              Serial.println("Data offline terkirim.");
            } else {
              Serial.println("Gagal kirim data offline, menyimpannya kembali...");
              tempFile.println(offlinePayload);
            }
            httpOffline.end();
            delay(500); // Jeda antar pengiriman agar server tidak rate limit
          }
        }
        file.close();
        tempFile.close();
        
        SD.remove("/offline_data.txt");
        File tFile = SD.open("/temp_data.txt", FILE_READ);
        if (tFile && tFile.available() > 0) {
          tFile.close();
          SD.rename("/temp_data.txt", "/offline_data.txt"); // Kembalikan sisanya
        } else {
          if (tFile) tFile.close();
          SD.remove("/temp_data.txt");
        }
        Serial.println("Sinkronisasi selesai.");
      }
    }

    // --- Kirim Data Saat Ini ---
    HTTPClient http;
    http.begin(serverUrl);
    
    // Header Wajib!
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", apiKey);
    
    Serial.println("\nMengirim data live: " + payloadLive);
    int httpResponseCode = http.POST(payloadLive);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String responseString = http.getString();
      Serial.println("Server Response: " + responseString);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      // Gagal kirim biarpun online? Simpan ke SD card saja!
      File file = SD.open("/offline_data.txt", FILE_APPEND);
      if (file) {
        file.println(payloadOffline);
        file.close();
      }
    }
    
    http.end(); // Bebaskan resource
  } else {
    // --- MODE OFFLINE ---
    Serial.println("WiFi Disconnected! Menyimpan data ke SD Card...");
    File file = SD.open("/offline_data.txt", FILE_APPEND);
    if (file) {
      file.println(payloadOffline);
      file.close();
      Serial.println("Data berhasil disimpan ke SD Card: " + payloadOffline);
    } else {
      Serial.println("Gagal membuka atau membuat file offline_data.txt di SD Card!");
    }
  }
  
  // Tunggu 5 detik sebelum baca & kirim data lagi
  delay(5000); 
}
