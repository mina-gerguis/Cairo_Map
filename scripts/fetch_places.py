import requests
import json
import time

headers = {
    'User-Agent': 'CairoMapExporter/1.0 (egypt_cairo_places_export)'
}

# Cairo & Giza bbox or area query
# Bounding box covering Cairo, Giza, New Cairo, 6th October, Sheikh Zayed, Helwan, Shubra, etc.
# South: 29.75, West: 30.80, North: 30.25, East: 31.70

query = """
[out:json][timeout:90];
(
  // Tourism & Heritage
  nwr["tourism"~"museum|attraction|hotel|viewpoint|zoo|theme_park|gallery"](29.75,30.80,30.25,31.70);
  nwr["historic"~"monument|memorial|castle|archaeological_site|ruins|palace|tomb|city_gate"](29.75,30.80,30.25,31.70);
  
  // Shopping & Malls
  nwr["shop"~"mall|department_store|supermarket"](29.75,30.80,30.25,31.70);
  
  // Healthcare
  nwr["amenity"~"hospital|clinic"](29.75,30.80,30.25,31.70);
  
  // Education
  nwr["amenity"~"university|college"](29.75,30.80,30.25,31.70);
  
  // Leisure & Parks & Sports
  nwr["leisure"~"park|sports_centre|stadium|water_park|garden"](29.75,30.80,30.25,31.70);
  
  // Diplomatic & Government
  nwr["amenity"~"embassy|courthouse|townhall"](29.75,30.80,30.25,31.70);
  
  // Transport hubs
  nwr["railway"~"station"](29.75,30.80,30.25,31.70);
  nwr["aeroway"~"aerodrome|terminal"](29.75,30.80,30.25,31.70);
  
  // Famous / Popular Cafes & Restaurants with names
  nwr["amenity"~"restaurant|cafe"][name](29.85,31.10,30.15,31.45);
);
out center;
"""

print("Sending Overpass query...")
try:
    r = requests.post("https://overpass-api.de/api/interpreter", data={'data': query}, headers=headers, timeout=120)
    print("Response code:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        elements = data.get('elements', [])
        print(f"Total elements retrieved: {len(elements)}")
        
        # Filter elements with names
        named = [e for e in elements if e.get('tags', {}).get('name') or e.get('tags', {}).get('name:ar') or e.get('tags', {}).get('name:en')]
        print(f"Elements with valid name: {len(named)}")
        
        with open("scripts/raw_places.json", "w", encoding="utf-8") as f:
            json.dump(elements, f, ensure_ascii=False, indent=2)
        print("Saved to scripts/raw_places.json")
    else:
        print("Error body:", r.text[:200])
except Exception as e:
    print("Error during request:", e)
