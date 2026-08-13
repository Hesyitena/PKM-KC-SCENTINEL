#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

// ================= KONFIGURASI JARINGAN =================
const char *ssid = "AK-VICTUS-16";
const char *password = "jendrajlc";

// ================= STATIC IP =================
IPAddress local_IP(10, 42, 0, 69);
IPAddress gateway(10, 42, 0, 1);
IPAddress subnet(255, 255, 255, 0);

WebServer server(80);

// ================= PIN =================
#define PIN_MQ135 34
#define PIN_MQ3 35
#define PIN_MQ4 32
#define PIN_TGS 33
#define PIN_DHT 4
#define DHTTYPE DHT22

DHT dht(PIN_DHT, DHTTYPE);

// ================= RESISTOR PENGAMAN & RL TERUKUR =================
const float RL_MQ135 = 1989.0;
const float RL_MQ3 = 1967.0;
const float RL_MQ4 = 14700.0;
const float RL_TGS = 1000.0;
const float VC = 5.0;

// ================= BASELINE Rs =================
float baseline_MQ135 = 4891.92;
float baseline_MQ3 = 4374.15;
float baseline_MQ4 = 20586.55;
float baseline_TGS = 2309.61;

// Toleransi "sudah kembali ke baseline" sebelum sampel berikutnya boleh diambil.
// 0.05 artinya rasio harus di rentang 0.95-1.05 (5% dari baseline).
const float RECOVERY_TOLERANCE = 0.05;

// ================= STATE SESI =================
int sampleID = 0;
String batchID = "";      // ID batch fisik (mis. "AYAM-A") - TERPISAH dari sampleID
String currentLabel = "";
bool sessionActive = false;
unsigned long sessionStartMillis = 0; // dipakai untuk hitung elapsed time sejak START

float last_r135 = 0, last_r3 = 0, last_r4 = 0, last_rTGS = 0;
float last_suhu = 0, last_lembap = 0;

unsigned long lastRead = 0;
const unsigned long READ_INTERVAL_MS = 500; // interval time-series, dipertahankan cepat & konsisten

unsigned long lastDHT = 0;
const unsigned long DHT_INTERVAL_MS = 2500;

// ================= STATE KALIBRASI BASELINE =================
bool calibrating = false;
unsigned long calibStart = 0;
const unsigned long CALIB_DURATION_MS = 60000;
int calibCount = 0;
double sumRs135 = 0, sumRs3 = 0, sumRs4 = 0, sumRsTGS = 0;

float hitungRs(float vout, float RL)
{
  if (vout < 0.001)
    vout = 0.001;
  return ((VC - vout) / vout) * RL;
}

void bacaSensorMentah(float &rs135, float &rs3, float &rs4, float &rsTGS)
{
  int raw135 = analogRead(PIN_MQ135);
  int raw3 = analogRead(PIN_MQ3);
  int raw4 = analogRead(PIN_MQ4);
  int rawTGS = analogRead(PIN_TGS);

  float v135 = raw135 / 4095.0 * 3.3;
  float v3 = raw3 / 4095.0 * 3.3;
  float v4 = raw4 / 4095.0 * 3.3;
  float vTGS = rawTGS / 4095.0 * 3.3;

  rs135 = hitungRs(v135, RL_MQ135);
  rs3 = hitungRs(v3, RL_MQ3);
  rs4 = hitungRs(v4, RL_MQ4);
  rsTGS = hitungRs(vTGS, RL_TGS);
}

// Cek apakah SEMUA rasio sudah kembali ke rentang baseline (dipakai sebagai
// indikator "aman lanjut ke sampel berikutnya", menggantikan timer tetap.
bool sudahKembaliBaseline()
{
  return (fabs(last_r135 - 1.0) <= RECOVERY_TOLERANCE) &&
         (fabs(last_r3 - 1.0) <= RECOVERY_TOLERANCE) &&
         (fabs(last_r4 - 1.0) <= RECOVERY_TOLERANCE) &&
         (fabs(last_rTGS - 1.0) <= RECOVERY_TOLERANCE);
}

// ---- Handler endpoint HTTP ----

void handleData()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  unsigned long elapsed = sessionActive ? (millis() - sessionStartMillis) : 0;

  String json = "{";
  json += "\"session_active\":" + String(sessionActive ? "true" : "false") + ",";
  json += "\"calibrating\":" + String(calibrating ? "true" : "false") + ",";
  json += "\"calib_elapsed_ms\":" + String(calibrating ? (millis() - calibStart) : 0) + ",";
  json += "\"calib_duration_ms\":" + String(CALIB_DURATION_MS) + ",";
  json += "\"calib_count\":" + String(calibCount) + ",";
  json += "\"sample_id\":" + String(sampleID) + ",";
  json += "\"batch_id\":\"" + batchID + "\",";
  json += "\"label\":\"" + currentLabel + "\",";
  json += "\"elapsed_ms\":" + String(elapsed) + ",";
  json += "\"mq135_ratio\":" + String(last_r135, 4) + ",";
  json += "\"mq3_ratio\":" + String(last_r3, 4) + ",";
  json += "\"mq4_ratio\":" + String(last_r4, 4) + ",";
  json += "\"tgs_ratio\":" + String(last_rTGS, 4) + ",";
  json += "\"suhu\":" + String(last_suhu, 1) + ",";
  json += "\"lembap\":" + String(last_lembap, 1) + ",";
  json += "\"recovered\":" + String(sudahKembaliBaseline() ? "true" : "false");
  json += "}";
  server.send(200, "application/json", json);
}

void handleStart()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  if (server.hasArg("id") && server.hasArg("batch") && server.hasArg("label"))
  {
    sampleID = server.arg("id").toInt();
    batchID = server.arg("batch");
    currentLabel = server.arg("label");
    sessionActive = true;
    sessionStartMillis = millis(); // t=0 untuk time-series sampel ini
    server.send(200, "text/plain", "OK: sesi dimulai id=" + String(sampleID) +
                                        " batch=" + batchID + " label=" + currentLabel);
  }
  else
  {
    server.send(400, "text/plain", "Parameter id/batch/label kurang");
  }
}

void handleCalibrate()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  if (calibrating)
  {
    server.send(409, "text/plain", "Kalibrasi sudah berjalan");
    return;
  }
  mulaiKalibrasi();
  server.send(200, "text/plain", "OK: kalibrasi dimulai selama 60 detik");
}

void handleStop()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  sessionActive = false;
  currentLabel = "";
  server.send(200, "text/plain", "OK: sesi dihentikan");
}

void handleOptions()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  server.send(204);
}

// ---- Perintah Serial ----

void mulaiKalibrasi()
{
  calibrating = true;
  calibStart = millis();
  calibCount = 0;
  sumRs135 = sumRs3 = sumRs4 = sumRsTGS = 0;
  Serial.println("=== KALIBRASI BASELINE DIMULAI ===");
  Serial.println("Pastikan sensor di udara bersih, jangan sentuh apa pun selama 60 detik.");
}

void selesaikanKalibrasi()
{
  calibrating = false;
  if (calibCount == 0)
  {
    Serial.println("Kalibrasi gagal: tidak ada data terkumpul.");
    return;
  }
  baseline_MQ135 = sumRs135 / calibCount;
  baseline_MQ3 = sumRs3 / calibCount;
  baseline_MQ4 = sumRs4 / calibCount;
  baseline_TGS = sumRsTGS / calibCount;

  Serial.println("=== KALIBRASI SELESAI ===");
  Serial.printf("Jumlah sampel dirata-ratakan: %d\n", calibCount);
  Serial.println("--- SALIN NILAI INI KE BAGIAN ATAS KODE (baseline_...) ---");
  Serial.printf("float baseline_MQ135 = %.2f;\n", baseline_MQ135);
  Serial.printf("float baseline_MQ3   = %.2f;\n", baseline_MQ3);
  Serial.printf("float baseline_MQ4   = %.2f;\n", baseline_MQ4);
  Serial.printf("float baseline_TGS   = %.2f;\n", baseline_TGS);
  Serial.println("Baseline baru ini SUDAH AKTIF dipakai sekarang (sampai ESP32 di-restart).");
}

void bacaPerintahSerial()
{
  if (Serial.available())
  {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "CALIBRATE")
    {
      mulaiKalibrasi();
    }
    else if (cmd.startsWith("START"))
    {
      // Format: START <id> <batch> <label>
      int s1 = cmd.indexOf(' ');
      int s2 = cmd.indexOf(' ', s1 + 1);
      int s3 = cmd.indexOf(' ', s2 + 1);
      if (s1 > 0 && s2 > 0 && s3 > 0)
      {
        sampleID = cmd.substring(s1 + 1, s2).toInt();
        batchID = cmd.substring(s2 + 1, s3);
        currentLabel = cmd.substring(s3 + 1);
        sessionActive = true;
        sessionStartMillis = millis();
        Serial.printf("Sesi dimulai: sample_id=%d batch_id=%s label=%s\n",
                      sampleID, batchID.c_str(), currentLabel.c_str());
      }
      else
      {
        Serial.println("Format salah. Contoh: START 1 AYAM-A LAYAK");
      }
    }
    else if (cmd == "STOP")
    {
      sessionActive = false;
      currentLabel = "";
      Serial.println("Sesi dihentikan.");
    }
  }
}

void setup()
{
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
  dht.begin();

  if (!WiFi.config(local_IP, gateway, subnet))
  {
    Serial.println("Gagal set static IP, lanjut pakai DHCP normal.");
  }

  WiFi.begin(ssid, password);
  Serial.print("Menyambung WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi tersambung!");
  Serial.print("IP Address ESP32: ");
  Serial.println(WiFi.localIP());
  Serial.println(">>> Masukkan IP ini di halaman data collector <<<");
  Serial.println();
  Serial.println("Perintah Serial tersedia:");
  Serial.println("  CALIBRATE                    -> ukur baseline Rs otomatis 60 detik di udara bersih");
  Serial.println("  START <id> <batch> <label>   -> mulai sesi sampel, mis: START 1 AYAM-A LAYAK");
  Serial.println("  STOP                         -> hentikan sesi");

  server.on("/data", HTTP_GET, handleData);
  server.on("/start", HTTP_GET, handleStart);
  server.on("/stop", HTTP_GET, handleStop);
  server.on("/calibrate", HTTP_GET, handleCalibrate);
  server.onNotFound(handleOptions);

  server.begin();
  Serial.println("Web server ESP32 aktif di port 80.");
}

void loop()
{
  server.handleClient();
  bacaPerintahSerial();

  // ---- Mode kalibrasi baseline ----
  if (calibrating)
  {
    if (millis() - lastRead >= READ_INTERVAL_MS)
    {
      lastRead = millis();
      float rs135, rs3, rs4, rsTGS;
      bacaSensorMentah(rs135, rs3, rs4, rsTGS);

      sumRs135 += rs135;
      sumRs3 += rs3;
      sumRs4 += rs4;
      sumRsTGS += rsTGS;
      calibCount++;

      Serial.printf("Kalibrasi #%d: Rs135=%.1f Rs3=%.1f Rs4=%.1f RsTGS=%.1f\n",
                    calibCount, rs135, rs3, rs4, rsTGS);
    }

    if (millis() - calibStart >= CALIB_DURATION_MS)
    {
      selesaikanKalibrasi();
    }
    return;
  }

  // ---- Baca sensor gas (time-series, interval 500ms, aktif terus meski sesi tidak aktif -----
  // supaya dashboard tetap bisa menampilkan status "recovered" bahkan di luar sesi Start/Stop.
  if (millis() - lastRead >= READ_INTERVAL_MS)
  {
    lastRead = millis();

    float rs135, rs3, rs4, rsTGS;
    bacaSensorMentah(rs135, rs3, rs4, rsTGS);

    last_r135 = rs135 / baseline_MQ135;
    last_r3 = rs3 / baseline_MQ3;
    last_r4 = rs4 / baseline_MQ4;
    last_rTGS = rsTGS / baseline_TGS;

    unsigned long elapsed = sessionActive ? (millis() - sessionStartMillis) : 0;

    Serial.printf("t=%lu id=%d batch=%s label=%s | rasio135=%.3f rasio3=%.3f rasio4=%.3f rasioTGS=%.3f | suhu=%.1f lembap=%.1f\n",
                  elapsed, sampleID, batchID.c_str(), currentLabel.c_str(),
                  last_r135, last_r3, last_r4, last_rTGS, last_suhu, last_lembap);
  }

  // ---- Baca DHT22 (interval terpisah 2.5 detik) ----
  if (millis() - lastDHT >= DHT_INTERVAL_MS)
  {
    lastDHT = millis();
    float suhu = dht.readTemperature();
    float lembap = dht.readHumidity();
    if (!isnan(suhu))
      last_suhu = suhu;
    if (!isnan(lembap))
      last_lembap = lembap;

    if (isnan(suhu) || isnan(lembap))
    {
      Serial.println("Peringatan: gagal baca DHT22 - cek wiring pin 4 / VCC 3.3V");
    }
  }
}