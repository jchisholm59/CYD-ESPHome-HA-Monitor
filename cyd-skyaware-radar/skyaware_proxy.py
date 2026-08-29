#!/usr/bin/env python3
import json
import urllib.request
import math
from http.server import HTTPServer, BaseHTTPRequestHandler

# --- CONFIGURATION ---
# Change this to your PiAware/SkyAware IP address
PIAWARE_IP = "192.168.50.171"

# Your home receiver coordinates
HOME_LAT = 44.65369
HOME_LON = -63.81416

# Radar settings
MAX_RANGE_NM = 100.0  # Limit scanning radius to save network data
PORT = 5050

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/nearby":
            self.handle_nearby()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

    def handle_nearby(self):
        urls = [
            f"http://{PIAWARE_IP}/skyaware/data/aircraft.json",
            f"http://{PIAWARE_IP}/dump1090-fa/data/aircraft.json",
            f"http://{PIAWARE_IP}/data/aircraft.json"
        ]
        data = None
        last_error = None
        for url in urls:
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'skyaware-proxy'})
                with urllib.request.urlopen(req, timeout=3) as response:
                    data = json.loads(response.read().decode())
                    break # Success!
            except Exception as e:
                last_error = e
                continue

        if data is None:
            self.send_response(500)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(f"Error fetching data from all endpoints: {last_error}".encode())
            return

        nearby_aircraft = []
        aircraft_list = data.get("aircraft", [])
        
        for ac in aircraft_list:
            lat = ac.get("lat")
            lon = ac.get("lon")
            if lat is None or lon is None:
                continue

            # Calculate distance using flat-earth projection (accurate enough for local radar)
            d_lat = lat - HOME_LAT
            d_lon = lon - HOME_LON
            cos_lat = math.cos(math.radians(HOME_LAT))
            y_nm = d_lat * 60.0
            x_nm = d_lon * 60.0 * cos_lat
            dist = math.sqrt(x_nm * x_nm + y_nm * y_nm)

            if dist <= MAX_RANGE_NM:
                alt = ac.get("alt_baro")
                if alt is None or alt == "ground":
                    alt = ac.get("alt_geom", 0)
                if isinstance(alt, str):
                    alt = 0

                flight = ac.get("flight", "").strip()
                if not flight:
                    flight = ac.get("hex", "").strip()

                track = ac.get("track", 0)

                nearby_aircraft.append({
                    "flight": flight,
                    "alt": int(alt) if alt else 0,
                    "track": int(track) if track else 0,
                    "x_nm": round(x_nm, 2),
                    "y_nm": round(y_nm, 2)
                })

        # Sort by distance (closest first)
        nearby_aircraft.sort(key=lambda ac_item: ac_item["x_nm"]**2 + ac_item["y_nm"]**2)
        
        # Limit to top 12 closest planes to keep payload extremely tiny (around 500 bytes!)
        nearby_aircraft = nearby_aircraft[:12]

        # Send JSON response
        response_bytes = json.dumps(nearby_aircraft).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(response_bytes)

def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, ProxyHandler)
    print("=" * 60)
    print("📡 SkyAware Micro-Proxy Server Active!")
    print(f"🏠 Home Coordinates: {HOME_LAT}, {HOME_LON}")
    print(f"🛰️  Targeting PiAware at: http://{PIAWARE_IP}")
    print(f"🚪 Proxy Listening on Port: {PORT}")
    print(f"🔗 Local endpoint: http://127.0.0.1:{PORT}/nearby")
    print("=" * 60)
    print("Press Ctrl+C to stop the server.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    print("\nStopping proxy...")

if __name__ == "__main__":
    run()
