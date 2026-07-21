/**
 * SCENTINEL - ESP32 Dataset Logger (Simple Edition)
 * ===================================================
 * Tujuan: Pengambilan dataset MURNI untuk training Random Forest.
 *
 * Prinsip:
 *   - Kirim ADC mentah ke backend, TIDAK ada normalisasi/kalibrasi di sini.
 *   - Semua preprocessing dilakukan di Python sebelum training.
 *   - Firmware sesederhana mungkin = data paling dapat dipercaya.
 *
 * Sensor:
 *   - MQ-3   (GPIO 34) : Gas alkohol
 *   - MQ-4   (GPIO 35) : Gas metana
 *   - MQ-135 (GPIO 32) : VOC / kualitas udara
 *   - TGS2602 (GPIO 33): VOC / bau busuk
 *   - DHT22  (GPIO 4)  : Suhu & kelembapan
 *
 * Kontrol:
 *   - LED Biru (GPIO 2) : ON=standby, Kedip=kirim, Mati=WiFi putus
 *   - Tombol BOOT (GPIO 0) : Toggle label LAYAK <-> TIDAK LAYAK
 *
 * Dependencies (Arduino IDE):
 *   - DHT sensor library by Adafruit
 *   - ArduinoJson by Benoit Blanchon
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ============================================================
// KONFIGURASI WIFI & API
// ============================================================
const char* WIFI_SSID     = "SCENTINEL_DEV";
const char* WIFI_PASSWORD = "GANTI_PASSWORD_WIFI";
const char* API_URL       = "http://10.42.0.1:8081/api/readings";
const char* API_KEY       = "esp32-static-api-key-change-this";

// ============================================================
// LABEL (Toggle pakai tombol BOOT)
// ============================================================
String currentLabel = "LAYAK";

// ============================================================
// PIN & KONSTANTA
// ============================================================
#define PIN_MQ3         34
#define PIN_MQ4         35
#define PIN_MQ135       32
#define PIN_TGS2602     33
#define PIN_DHT22        4
#define PIN_LED          2
#define PIN_BTN          0

#define DHT_TYPE         DHT22
#define SAMPLE_INTERVAL  5000    // ms antar pengiriman data
#define ADC_SAMPLES      128     // Rata-rata ADC per sensor
#define WARMUP_MS        120000  // 2 menit warm-up (alat sudah dihidupin 15 menit sebelumnya)

DHT dht(PIN_DHT22, DHT_TYPE);
unsigned long lastSampleTime = 0;

// ============================================================
// FUNGSI: Baca ADC rata-rata (128 sampel, jeda 20µs)
// ============================================================
float readADC(int pin) {
  long sum = 0;
  for (int i = 0; i < ADC_SAMPLES; i++) {
    sum += analogRead(pin);
    delayMicroseconds(20);
  }
  return (float)sum / ADC_SAMPLES;
}

// ============================================================
// FUNGSI: Reconnect WiFi
// ============================================================
void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  digitalWrite(PIN_LED, LOW); // LED mati = WiFi putus
  Serial.print("[WIFI] Reconnecting");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK");
    digitalWrite(PIN_LED, HIGH);
  } else {
    Serial.println(" GAGAL");
  }
}

// ============================================================
// FUNGSI: Kirim data ke backend
// ============================================================
void sendData(float mq3, float mq4, float mq135, float tgs, float temp, float hum) {
  ensureWiFi();
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  StaticJsonDocument<256> doc;
  doc["mq3"]         = mq3;
  doc["mq4"]         = mq4;
  doc["mq135"]       = mq135;
  doc["tgs2602"]     = tgs;
  doc["temperature"] = temp;
  doc["humidity"]    = hum;
  doc["prediction"]  = currentLabel;

  String body;
  serializeJson(doc, body);

  // LED kedip cepat = sedang mengirim
  for (int i = 0; i < 3; i++) {
    digitalWrite(PIN_LED, LOW); delay(40);
    digitalWrite(PIN_LED, HIGH); delay(40);
  }

  int code = http.POST(body);
  if (code > 0) {
    Serial.printf("[OK] HTTP %d\n", code);
  } else {
    Serial.printf("[ERROR] Gagal: %s\n", http.errorToString(code).c_str());
  }
  http.end();
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BTN, INPUT_PULLUP);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db); // Range 0–3.3V

  dht.begin();

  Serial.println("\n=================================");
  Serial.println("SCENTINEL Dataset Logger");
  Serial.println("=================================");

  // Koneksi WiFi
  Serial.printf("Konek ke %s...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_LED, !digitalRead(PIN_LED));
    delay(300);
  }
  digitalWrite(PIN_LED, HIGH);
  Serial.printf("[OK] IP: %s\n", WiFi.localIP().toString().c_str());

  // Warm-up sensor
  Serial.printf("Warm-up sensor %d detik...\n", WARMUP_MS / 1000);
  unsigned long warmStart = millis();
  static unsigned long lastPrint = 0;
  while (millis() - warmStart < WARMUP_MS) {
    if (millis() - lastPrint >= 10000) {
      lastPrint = millis();
      unsigned long sisa = (WARMUP_MS - (millis() - warmStart)) / 1000;
      Serial.printf("Sisa: %lu detik...\n", sisa);
    }
    digitalWrite(PIN_LED, !digitalRead(PIN_LED));
    delay(500);
  }
  digitalWrite(PIN_LED, HIGH);

  Serial.println("=================================");
  Serial.printf("Label awal : %s\n", currentLabel.c_str());
  Serial.println("Tekan BOOT untuk ganti label.");
  Serial.println("Siap mengambil dataset!");
  Serial.println("=================================\n");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  // --- Toggle label via tombol BOOT ---
  static bool lastBtn = HIGH;
  bool btn = digitalRead(PIN_BTN);

  if (btn == LOW && lastBtn == HIGH) {
    delay(50); // debounce
    if (digitalRead(PIN_BTN) == LOW) {
      currentLabel = (currentLabel == "LAYAK") ? "TIDAK LAYAK" : "LAYAK";
      Serial.println("\n***************************************************");
      Serial.printf(">>> LABEL SEKARANG: %s\n", currentLabel.c_str());
      Serial.println("***************************************************\n");
      while (digitalRead(PIN_BTN) == LOW) delay(10); // tunggu lepas
    }
  }
  lastBtn = btn;

  // --- Sampling & Kirim ---
  if (millis() - lastSampleTime >= SAMPLE_INTERVAL) {
    lastSampleTime = millis();

    float mq3   = readADC(PIN_MQ3);
    float mq4   = readADC(PIN_MQ4);
    float mq135 = readADC(PIN_MQ135);
    float tgs   = readADC(PIN_TGS2602);
    float temp  = dht.readTemperature();
    float hum   = dht.readHumidity();

    if (isnan(temp) || isnan(hum)) {
      Serial.println("[WARN] DHT gagal baca, sampel dilewati.");
      return;
    }

    Serial.println("--------------------------------");
    Serial.printf("Label : %s\n", currentLabel.c_str());
    Serial.printf("MQ3   : %.0f\n", mq3);
    Serial.printf("MQ4   : %.0f\n", mq4);
    Serial.printf("MQ135 : %.0f\n", mq135);
    Serial.printf("TGS   : %.0f\n", tgs);
    Serial.printf("Temp  : %.2f C\n", temp);
    Serial.printf("Hum   : %.2f %%\n", hum);
    Serial.println("--------------------------------");

    sendData(mq3, mq4, mq135, tgs, temp, hum);
  }
}
