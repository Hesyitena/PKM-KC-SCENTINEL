/**
 * SCENTINEL - ESP32 Sensor Data Logger
 * =====================================
 * Pengambilan dataset untuk training model AI deteksi pembusukan makanan.
 * 
 * Sensor:
 *   - MQ-3   (GPIO 34) : Gas alkohol
 *   - MQ-4   (GPIO 35) : Gas metana
 *   - MQ-135 (GPIO 32) : VOC / kualitas udara
 *   - TGS2602 (GPIO 33): VOC / bau busuk
 *   - DHT22  (GPIO 4)  : Suhu & kelembapan
 * 
 * Output: CSV via Serial (115200 baud)
 * Format: timestamp,label,mq3,mq4,mq135,tgs2602,temperature,humidity
 * 
 * Cara pakai:
 *   1. Upload ke ESP32
 *   2. Buka Serial Monitor / jalankan serial_logger.py
 *   3. Letakkan sampel makanan di dekat sensor
 *   4. Tekan tombol BOOT (GPIO 0) untuk merekam satu sampel
 *   5. Atau biarkan auto-log setiap SAMPLE_INTERVAL ms
 */

#include <Arduino.h>
#include <DHT.h>

// ============================================================
// KONFIGURASI PIN
// ============================================================
#define PIN_MQ3      34    // ADC1_CH6
#define PIN_MQ4      35    // ADC1_CH7
#define PIN_MQ135    32    // ADC1_CH4
#define PIN_TGS2602  33    // ADC1_CH5
#define PIN_DHT22     4    // Digital
#define PIN_BTN_SAMPLE 0   // BOOT button (active LOW)
#define PIN_LED_STATUS 2   // Built-in LED

// ============================================================
// KONFIGURASI SAMPLING
// ============================================================
#define DHT_TYPE         DHT22
#define SAMPLE_INTERVAL  2000    // ms antar auto-sample
#define WARMUP_TIME      30000   // ms preheat sensor MQ (30 detik)
#define ADC_SAMPLES      64      // Rata-rata ADC untuk noise reduction
#define ADC_MAX          4095    // 12-bit ADC ESP32
#define SERIAL_BAUD      115200

// ============================================================
// LABEL MAKANAN — ubah sesuai sampel yang sedang direkam
// ============================================================
// Mode 0 = LAYAK (segar)
// Mode 1 = TIDAK LAYAK (busuk)
// Ganti nilai ini sebelum upload untuk tiap sesi pengambilan data


const int   FOOD_LABEL = 0;           // 0 = LAYAK, 1 = TIDAK LAYAK
const char* LABEL_STR[] = { "LAYAK", "TIDAK_LAYAK" };

// ============================================================
// OBJEK
// ============================================================
DHT dht(PIN_DHT22, DHT_TYPE);

// ============================================================
// VARIABEL GLOBAL
// ============================================================
unsigned long lastSampleTime  = 0;
unsigned long startTime       = 0;
bool          warmedUp        = false;
bool          headerPrinted   = false;
int           sampleCount     = 0;
bool          btnLastState    = HIGH;

// ============================================================
// FUNGSI: Baca ADC dengan rata-rata (noise reduction)
// ============================================================
float readADCAverage(int pin, int samples = ADC_SAMPLES) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(100);
  }
  return (float)sum / samples;
}

// ============================================================
// FUNGSI: Cetak header CSV
// ============================================================
void printCSVHeader() {
  Serial.println(F("# SCENTINEL Dataset Logger v1.0"));
  Serial.println(F("# Format: timestamp_ms,label,mq3_raw,mq4_raw,mq135_raw,tgs2602_raw,temperature_c,humidity_pct,sample_id"));
  Serial.println(F("timestamp_ms,label,mq3_raw,mq4_raw,mq135_raw,tgs2602_raw,temperature_c,humidity_pct,sample_id"));
  headerPrinted = true;
}

// ============================================================
// FUNGSI: Ambil & kirim satu sampel
// ============================================================
void takeSample() {
  // Baca sensor gas (rata-rata 64x)
  float mq3    = readADCAverage(PIN_MQ3);
  float mq4    = readADCAverage(PIN_MQ4);
  float mq135  = readADCAverage(PIN_MQ135);
  float tgs2602 = readADCAverage(PIN_TGS2602);

  // Baca DHT22 (beri delay untuk stabilisasi)
  delay(50);
  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();

  // Validasi DHT22
  if (isnan(temperature) || isnan(humidity)) {
    // Coba sekali lagi
    delay(500);
    temperature = dht.readTemperature();
    humidity    = dht.readHumidity();
  }

  // Timestamp dalam milidetik sejak warmup selesai
  unsigned long ts = millis() - startTime;

  // Feedback LED
  digitalWrite(PIN_LED_STATUS, LOW);  // ON
  
  // Output CSV
  if (!headerPrinted) printCSVHeader();

  Serial.print(ts);
  Serial.print(F(","));

  Serial.print(LABEL_STR[FOOD_LABEL]);
  Serial.print(F(","));
  Serial.print((int)mq3);
  Serial.print(F(","));
  Serial.print((int)mq4);
  Serial.print(F(","));
  Serial.print((int)mq135);
  Serial.print(F(","));
  Serial.print((int)tgs2602);
  Serial.print(F(","));
  
  if (isnan(temperature)) {
    Serial.print(F("NaN"));
  } else {
    Serial.print(temperature, 2);
  }
  Serial.print(F(","));
  
  if (isnan(humidity)) {
    Serial.print(F("NaN"));
  } else {
    Serial.print(humidity, 2);
  }
  Serial.print(F(","));
  Serial.println(sampleCount);

  sampleCount++;
  
  delay(100);
  digitalWrite(PIN_LED_STATUS, HIGH);  // OFF
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(500);

  // Inisialisasi pin
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_BTN_SAMPLE, INPUT_PULLUP);
  digitalWrite(PIN_LED_STATUS, HIGH);

  // Inisialisasi ADC 12-bit
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);  // 0–3.3V range

  // Inisialisasi DHT22
  dht.begin();

  // Info startup
  Serial.println();
  Serial.println(F("# =========================================="));
  Serial.println(F("# SCENTINEL - Sensor Data Logger"));
  Serial.println(F("# =========================================="));

  Serial.print(F("# Label    : "));
  Serial.println(LABEL_STR[FOOD_LABEL]);
  Serial.print(F("# Interval : "));
  Serial.print(SAMPLE_INTERVAL);
  Serial.println(F(" ms"));
  Serial.println(F("# Tombol BOOT = rekam manual"));
  Serial.println(F("# =========================================="));

  // Preheat MQ sensors
  Serial.print(F("# Warming up sensors ("));
  Serial.print(WARMUP_TIME / 1000);
  Serial.println(F(" detik)..."));

  startTime = millis();
  
  // Countdown warmup dengan LED blink
  for (int i = WARMUP_TIME / 1000; i > 0; i--) {
    digitalWrite(PIN_LED_STATUS, LOW);
    delay(100);
    digitalWrite(PIN_LED_STATUS, HIGH);
    delay(900);
    
    if (i % 5 == 0) {
      Serial.print(F("# Sisa: "));
      Serial.print(i);
      Serial.println(F(" detik..."));
    }
  }

  warmedUp = true;
  startTime = millis();
  
  Serial.println(F("# Sensor siap! Mulai merekam data..."));
  Serial.println(F("# =========================================="));

  // Print header CSV
  printCSVHeader();

  // Blink cepat tanda siap
  for (int i = 0; i < 5; i++) {
    digitalWrite(PIN_LED_STATUS, LOW);
    delay(50);
    digitalWrite(PIN_LED_STATUS, HIGH);
    delay(50);
  }
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  unsigned long now = millis();
  
  // --- Auto-sampling berdasarkan interval ---
  if (now - lastSampleTime >= SAMPLE_INTERVAL) {
    lastSampleTime = now;
    takeSample();
  }

  // --- Manual sampling via BOOT button ---
  bool btnState = digitalRead(PIN_BTN_SAMPLE);
  if (btnState == LOW && btnLastState == HIGH) {
    delay(20);  // debounce
    if (digitalRead(PIN_BTN_SAMPLE) == LOW) {
      Serial.println(F("# [MANUAL] Tombol ditekan - rekam sampel"));
      takeSample();
    }
  }
  btnLastState = btnState;
}
