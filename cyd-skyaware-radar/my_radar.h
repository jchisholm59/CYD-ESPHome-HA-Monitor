#pragma once

#include "esphome.h"
#include <vector>
#include <string>

struct Aircraft {
  std::string flight;
  int alt;
  int track;
  float x_nm;
  float y_nm;
};

static std::vector<Aircraft> global_aircraft;
static bool is_updating = false;

inline void parse_aircraft_json(const std::string& json_str) {
  // Use selective ArduinoJson filtering to keep memory consumption near zero
  StaticJsonDocument<128> filter;
  JsonObject filter_item = filter.createNestedObject();
  filter_item["flight"] = true;
  filter_item["alt"] = true;
  filter_item["track"] = true;
  filter_item["x_nm"] = true;
  filter_item["y_nm"] = true;

  // 4KB is more than enough for our filtered 12-item list
  DynamicJsonDocument doc(4096);
  DeserializationError error = deserializeJson(doc, json_str, DeserializationOption::Filter(filter));
  if (error) {
    ESP_LOGE("radar", "JSON deserialization failed: %s", error.c_str());
    return;
  }

  std::vector<Aircraft> temp_aircraft;
  JsonArray arr = doc.as<JsonArray>();
  for (JsonObject obj : arr) {
    Aircraft ac;
    ac.flight = obj["flight"].as<std::string>();
    ac.alt = obj["alt"].as<int>();
    ac.track = obj["track"].as<int>();
    ac.x_nm = obj["x_nm"].as<float>();
    ac.y_nm = obj["y_nm"].as<float>();

    temp_aircraft.push_back(ac);
  }

  // Safe swap with updating lock
  is_updating = true;
  global_aircraft = std::move(temp_aircraft);
  is_updating = false;
}

template <typename T>
inline void draw_aircraft(T& it, int x, int y, int track, esphome::Color color) {
  float rad = track * M_PI / 180.0;
  float r = 6.0; // Size of plane silhouette
  
  // Nose
  int tx = x + r * sin(rad);
  int ty = y - r * cos(rad);
  
  // Rear Left
  int lx = x + r * sin(rad - 135.0 * M_PI / 180.0);
  int ly = y - r * cos(rad - 135.0 * M_PI / 180.0);
  
  // Rear Right
  int rx = x + r * sin(rad + 135.0 * M_PI / 180.0);
  int ry = y - r * cos(rad + 135.0 * M_PI / 180.0);
  
  it.line(tx, ty, lx, ly, color);
  it.line(lx, ly, rx, ry, color);
  it.line(rx, ry, tx, ty, color);
}
