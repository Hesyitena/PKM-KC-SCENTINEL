#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ✏️ 1. Ganti nama dan password WiFi-mu
const char* ssid = "SCENTINEL_DEV";
const char* password = "GANTI_PASSWORD_WIFI";

// ✏️ 2. IP laptop kamu = 10.252.133.115, port 8081
const char* serverName = "http://10.42.0.1:8081/api/readings/";

// ✏️ 3. API Key dari .env = esp32-static-api-key-change-this
const char* apiKey = "esp32-static-api-key-change-this";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", apiKey);

    StaticJsonDocument<256> doc;
    doc["device_id"]  = 1;
    doc["mq3"]        = random(100, 300);
    doc["mq4"]        = random(100, 300);
    doc["mq135"]      = random(100, 300);
    doc["tgs2602"]    = random(100, 300);
    doc["temperature"] = 28.5;
    doc["humidity"]   = 65.0;
    doc["prediction"] = "LAYAK";
    doc["confidence"] = 0.95;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    Serial.print("HTTP Response: ");
    Serial.println(code);
    if(code > 0) Serial.println(http.getString());
    else Serial.println("ERROR: " + String(code));

    http.end();
  }
  delay(5000);
}
