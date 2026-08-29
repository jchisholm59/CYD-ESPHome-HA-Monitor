# CYD SkyAware ADS-B Flight Radar Display 📡✈️

Real-time Air Traffic Control (ATC) style radar display for your **Cheap Yellow Display (CYD / ESP32-2432S028R)**. It connects to your local **PiAware / SkyAware (dump1090/readsb)** server and plots nearby aircraft callsigns, headings, and altitudes in real-time!

---

## 🏗️ Architecture

A standard ESP32 only has ~320KB of RAM, making it impossible to download and parse a massive **100KB–200KB raw `aircraft.json` payload** from PiAware directly without running out of heap memory and crash-looping. 

To solve this, we use a **Micro-Proxy Architecture**:
1. **The Python Proxy (`skyaware_proxy.py`)**: Runs on a local computer in your home (e.g. your Mac Mini). It fetches the raw JSON, performs distance math relative to your home receiver, filters down to the **12 closest aircraft**, and scales them.
2. **The Tiny JSON Feed**: The proxy outputs a super-compressed **500-byte JSON list** containing pre-processed coordinates.
3. **The CYD Display**: Polls the proxy every 5 seconds. Since the payload is so tiny, parsing takes microseconds, keeping your CYD stable, responsive, and completely crash-free!

---

## 🛠️ File Structure

This folder contains:
1. `skyaware_proxy.py` - The lightweight Python 3 micro-proxy server.
2. `skyaware-radar.yaml` - The ESPHome configuration for the standard CYD (ILI9341 320x240).
3. `my_radar.h` - The selective JSON parsing and drawing C++ radar engine.

---

## 🚀 Setup Instructions

### Step 1: Run the Python Proxy on your Mac/Server

1. Place `skyaware_proxy.py` on your computer.
2. Open the script and verify your configurations at the top of the file:
   * `PIAWARE_IP`: Change this to your PiAware's local IP address (e.g. `192.168.50.171`).
   * `HOME_LAT` & `HOME_LON`: Set your receiver's coordinates.
   * `PORT`: The port the proxy listens on (defaults to `5050`).
3. Make the script executable and run it:
   ```bash
   chmod +x skyaware_proxy.py
   ./skyaware_proxy.py
   ```
4. **Running in the Background (Recommended)**: To keep the proxy running invisibly even after closing your terminal, launch it with `nohup`:
   ```bash
   nohup python3 skyaware_proxy.py > /dev/null 2>&1 &
   ```

---

### Step 2: Configure and Flash the CYD

1. Open `skyaware-radar.yaml` in your editor.
2. Replace the placeholder IP address on **Line 49** with your **Mac's local IP address** where the proxy is running:
   ```yaml
   url: "http://<YOUR_MAC_IP>:5050/nearby"
   ```
3. Copy **`skyaware-radar.yaml`** and **`my_radar.h`** into your Home Assistant **`esphome/`** directory.
4. Flash the code to your Cheap Yellow Display!

---

## 🗺️ Display Guide

* **Radar Rings**: Shows concentric circles corresponding to **10, 20, and 30 Nautical Miles (NM)** out from your home.
* **Red Center Circle**: Your home/receiver location.
* **Plane Silhouette**: Triangles rotated to point exactly in the aircraft's tracking direction.
* **Altitude Color-Coding**:
  * **White**: High Cruise Altitude (> 20,000 ft)
  * **Green**: Normal Altitude (5,000–20,000 ft)
  * **Yellow**: Low Altitude (< 5,000 ft / Descending/Ascending)
* **Labels**: Displays the Flight Callsign (e.g., `SWA1234`) and Altitude (e.g., `34K` for 34,000 ft).

---

Happy tracking! 🛰️✈️
