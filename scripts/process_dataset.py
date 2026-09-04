import json
import re
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def load_data():
    with open("scripts/raw_places.json", "r", encoding="utf-8") as f:
        return json.load(f)

def clean_text(text):
    if not text:
        return ""
    text = str(text).strip()
    return text

def determine_coords(item):
    if "lat" in item and "lon" in item:
        return round(float(item["lat"]), 6), round(float(item["lon"]), 6)
    if "center" in item:
        return round(float(item["center"]["lat"]), 6), round(float(item["center"]["lon"]), 6)
    return None, None

def determine_governorate_and_district(lat, lon, tags):
    # Check tags first
    city = tags.get("addr:city", "").strip()
    district_tag = tags.get("addr:district", "") or tags.get("addr:suburb", "") or tags.get("addr:neighbourhood", "") or tags.get("addr:quarter", "")
    
    # Coordinates-based boundary heuristic
    # Nile line approximately around lon 31.21 - 31.24 depending on latitude
    # Zamalek (lon 31.215 - 31.228, lat 30.05 - 30.075) is Cairo
    # Gezira/Zamalek island is Cairo
    # Downtown: lat 30.04-30.06, lon 31.23-31.25 -> Cairo
    # Heliopolis: lat 30.07-30.13, lon 31.31-31.36 -> Cairo
    # Nasr City: lat 30.03-30.09, lon 31.32-31.39 -> Cairo
    # New Cairo / 5th Settlement: lat 29.98-30.07, lon 31.40-31.58 -> Cairo
    # Maadi: lat 29.94-29.98, lon 31.25-31.32 -> Cairo
    # Mokattam: lat 30.00-30.03, lon 31.28-31.33 -> Cairo
    # Helwan: lat 29.80-29.88, lon 31.28-31.35 -> Cairo
    # Shorouk / Madinaty / Rehab: lon > 31.45, lat 30.02-30.15 -> Cairo
    # Dokki: lat 30.03-30.05, lon 31.19-31.22 -> Giza
    # Mohandessin: lat 30.05-30.07, lon 31.18-31.21 -> Giza
    # Agouza: lat 30.05-30.07, lon 31.20-31.22 -> Giza
    # Giza city / Haram / Faisal: lat 29.98-30.03, lon 31.10-31.21 -> Giza
    # 6th of October / Sheikh Zayed: lat 29.90-30.10, lon 30.80-31.05 -> Giza
    # Imbaba / Kit Kat: lat 30.06-30.10, lon 31.19-31.22 -> Giza
    
    gov = "القاهرة"
    dist = "وسط البلد"

    # Specific district mapping by coordinates
    if 30.80 <= lon <= 31.05:
        gov = "الجيزة"
        if lat >= 30.00:
            dist = "الشيخ زايد"
        else:
            dist = "مدينة 6 أكتوبر"
    elif 31.05 < lon <= 31.16:
        gov = "الجيزة"
        if lat <= 30.01:
            dist = "الهرم وفيصل"
        else:
            dist = "أكتوبر / كرداسة"
    elif 31.16 < lon <= 31.225:
        # Check if Zamalek Island
        if 30.050 <= lat <= 30.075 and 31.214 <= lon <= 31.228:
            gov = "القاهرة"
            dist = "الزمالك"
        elif 30.035 <= lat <= 30.050 and 31.218 <= lon <= 31.229:
            gov = "القاهرة"
            dist = "الجزيرة وجاردن سيتي"
        elif lat >= 30.07:
            gov = "الجيزة"
            dist = "إمبابة والوراق"
        elif 30.045 <= lat < 30.07:
            gov = "الجيزة"
            dist = "المهندسين والعجوزة"
        elif 30.02 <= lat < 30.045:
            gov = "الجيزة"
            dist = "الدقي"
        else:
            gov = "الجيزة"
            dist = "الجيزة والعمرانية"
    elif 31.225 < lon <= 31.27:
        gov = "القاهرة"
        if 30.035 <= lat <= 30.065:
            dist = "وسط البلد والتحرير"
        elif 30.065 < lat <= 30.12:
            dist = "شبرا والساحل"
        elif 29.93 <= lat < 30.00:
            dist = "المعادي وطرة"
        elif 30.00 <= lat < 30.035:
            dist = "مصر القديمة والمنيل"
        elif lat < 29.93:
            dist = "حلوان والمعصرة"
        else:
            dist = "العباسية والوايلي"
    elif 31.27 < lon <= 31.36:
        gov = "القاهرة"
        if 30.07 <= lat <= 30.15:
            dist = "مصر الجديدة والنزهة"
        elif 30.02 <= lat < 30.07:
            dist = "مدينة نصر"
        elif 29.98 <= lat < 30.02:
            dist = "المقطم والهضبة الوسطى"
        elif 29.93 <= lat < 29.98:
            dist = "المعادي الجديدة ودجلة"
        elif lat < 29.93:
            dist = "حلوان والتبين"
        else:
            dist = "عين شمس والمطرية"
    elif 31.36 < lon <= 31.48:
        gov = "القاهرة"
        if 30.08 <= lat <= 30.18:
            dist = "طريق السويس ومطار القاهرة"
        elif 29.96 <= lat < 30.08:
            dist = "التجمع الخامس والقاهرة الجديدة"
        else:
            dist = "القاهرة الجديدة"
    elif lon > 31.48:
        gov = "القاهرة"
        if lat >= 30.10:
            dist = "مدينة الشروق وبدر"
        elif lat >= 30.03:
            dist = "مدينتي والرحاب"
        else:
            dist = "التجمع الأول والعاصمة الإدارية"

    # Override district if tag has clear name
    if district_tag:
        dt = district_tag.strip()
        if any(x in dt for x in ["Maadi", "معادي"]):
            dist = "المعادي"
            gov = "القاهرة"
        elif any(x in dt for x in ["Nasr", "نصر"]):
            dist = "مدينة نصر"
            gov = "القاهرة"
        elif any(x in dt for x in ["Heliopolis", "مصر الجديدة"]):
            dist = "مصر الجديدة"
            gov = "القاهرة"
        elif any(x in dt for x in ["Zamalek", "الزمالك"]):
            dist = "الزمالك"
            gov = "القاهرة"
        elif any(x in dt for x in ["Dokki", "دقي"]):
            dist = "الدقي"
            gov = "الجيزة"
        elif any(x in dt for x in ["Mohandessin", "مهندسين"]):
            dist = "المهندسين"
            gov = "الجيزة"
        elif any(x in dt for x in ["October", "أكتوبر", "6th"]):
            dist = "مدينة 6 أكتوبر"
            gov = "الجيزة"
        elif any(x in dt for x in ["Zayed", "زايد"]):
            dist = "الشيخ زايد"
            gov = "الجيزة"
        elif any(x in dt for x in ["Tagamoa", "New Cairo", "التجمع", "القاهرة الجديدة"]):
            dist = "التجمع الخامس والقاهرة الجديدة"
            gov = "القاهرة"

    return gov, dist

def categorize_place(tags):
    tourism = tags.get("tourism")
    historic = tags.get("historic")
    amenity = tags.get("amenity")
    shop = tags.get("shop")
    leisure = tags.get("leisure")
    railway = tags.get("railway")
    aeroway = tags.get("aeroway")
    office = tags.get("office")
    
    # 1. Tourism & Heritage
    if tourism in ["museum", "gallery"]:
        return "السياحة والآثار والمتاحف", "متحف ومعرض فني"
    if tourism in ["attraction", "viewpoint", "theme_park", "zoo", "aquarium"]:
        return "السياحة والآثار والمتاحف", "معلم سياحي وترفيهي"
    if historic:
        if historic in ["monument", "memorial"]:
            return "السياحة والآثار والمتاحف", "نصب تذكاري ومعلم تاريخي"
        if historic in ["archaeological_site", "ruins", "pyramid"]:
            return "السياحة والآثار والمتاحف", "موقع أثري وتاريخي"
        if historic in ["castle", "palace", "fort"]:
            return "السياحة والآثار والمتاحف", "قصر وقلعة أثرية"
        if historic in ["city_gate"]:
            return "السياحة والآثار والمتاحف", "بوابة ومعلم تاريخي"
        if historic in ["tomb"]:
            return "السياحة والآثار والمتاحف", "أثر وضريح تاريخي"
        return "السياحة والآثار والمتاحف", "معلم تاريخي"
        
    # 2. Hotels & Hospitality
    if tourism in ["hotel", "guest_house", "motel", "resort"]:
        stars = tags.get("stars", "")
        desc = f"فندق {stars} نجوم" if stars else "فندق ومنتجع سياحي"
        return "الفنادق والضيافة", desc
        
    # 3. Malls & Shopping
    if shop in ["mall"]:
        return "المولات ومراكز التسوق", "مول ومركز تسوق تجاري"
    if shop in ["department_store"]:
        return "المولات ومراكز التسوق", "مجمع تجاري وماركات"
    if shop in ["supermarket"]:
        return "الأسواق والهايبر ماركت", "سوبرماركت وهايبرماركت"
        
    # 4. Medical & Healthcare
    if amenity in ["hospital"]:
        return "المستشفيات والمراكز الطبية", "مستشفى تخصصي وعام"
    if amenity in ["clinic", "doctors", "dentist"]:
        return "المستشفيات والمراكز الطبية", "مركز طبي وعيادات"
    if amenity in ["pharmacy"]:
        return "المستشفيات والمراكز الطبية", "صيدلية ومستلزمات طبية"
        
    # 5. Higher Education & Research
    if amenity in ["university"]:
        return "الجامعات والتعليم", "جامعة وصرح أكاديمي"
    if amenity in ["college", "school"]:
        return "الجامعات والتعليم", "كلية ومعهد تعليمي"
        
    # 6. Restaurants & Cafes
    if amenity in ["restaurant"]:
        cuisine = tags.get("cuisine", "")
        c_desc = f"مطعم ({cuisine})" if cuisine else "مطعم مأكولات"
        return "المطاعم والكافيهات", c_desc
    if amenity in ["cafe"]:
        return "المطاعم والكافيهات", "كافيه ومقهى"
    if amenity in ["fast_food"]:
        return "المطاعم والكافيهات", "وجبات سريعة"
        
    # 7. Parks, Clubs & Sports
    if leisure in ["park", "garden"]:
        return "الحدائق والنوادي والترفيه", "حديقة عامة ومتنزه"
    if leisure in ["sports_centre", "fitness_centre", "stadium", "pitch"]:
        return "الحدائق والنوادي والترفيه", "نادي رياضي واستاد"
    if leisure in ["water_park"]:
        return "الحدائق والنوادي والترفيه", "مدينة ألعاب مائية"
        
    # 8. Transport & Airports
    if aeroway in ["aerodrome", "terminal"]:
        return "النقل والمواصلات والمطارات", "مطار وصالة سفر"
    if railway in ["station", "subway_entrance"]:
        return "النقل والمواصلات والمطارات", "محطة قطار ومترو"
    if amenity in ["bus_station"]:
        return "النقل والمواصلات والمطارات", "محطة حافلات ونقل عام"
        
    # 9. Government & Diplomatic
    if amenity in ["embassy"]:
        country = tags.get("country", "")
        return "السفارات والمباني الحكومية", f"سفارة {country}" if country else "سفارة وقنصلية"
    if amenity in ["courthouse", "townhall", "police"]:
        return "السفارات والمباني الحكومية", "مبنى وهيئة حكومية"
        
    # 10. Banks
    if amenity in ["bank", "atm"]:
        return "البنوك والخدمات المالية", "بنك ومصرف مالي"
        
    return "أماكن وخدمات عامة", "مرفق ومعلم عام"

def format_names(tags):
    name_ar = tags.get("name:ar", "").strip()
    name_en = tags.get("name:en", "").strip()
    name_default = tags.get("name", "").strip()
    
    # Check if default is Arabic
    has_arabic = bool(re.search(r'[\u0600-\u06FF]', name_default))
    
    if not name_ar:
        if has_arabic:
            name_ar = name_default
        else:
            name_ar = name_default # fallback
            
    if not name_en:
        if not has_arabic and name_default:
            name_en = name_default
        else:
            name_en = tags.get("int_name", "") or tags.get("name:fr", "")
            
    # Clean up empty strings
    if not name_ar and name_en:
        name_ar = name_en
    if not name_en and name_ar:
        name_en = ""
        
    return name_ar, name_en

def extract_address_details(tags, dist, gov):
    street = tags.get("addr:street", "").strip()
    housenumber = tags.get("addr:housenumber", "").strip()
    full_addr = tags.get("addr:full", "").strip()
    
    parts = []
    if full_addr:
        return full_addr
    if housenumber and street:
        parts.append(f"{housenumber} شارع {street}")
    elif street:
        parts.append(f"شارع {street}")
        
    parts.append(dist)
    parts.append(gov)
    return "، ".join([p for p in parts if p])

def build_dataset():
    raw_data = load_data()
    places = []
    seen = set()
    
    for item in raw_data:
        tags = item.get("tags", {})
        if not tags:
            continue
            
        name_default = tags.get("name") or tags.get("name:ar") or tags.get("name:en")
        if not name_default:
            continue
            
        lat, lon = determine_coords(item)
        if not lat or not lon:
            continue
            
        # Deduplication key based on name and rounded coords
        key = (name_default.strip().lower(), round(lat, 3), round(lon, 3))
        if key in seen:
            continue
        seen.add(key)
        
        name_ar, name_en = format_names(tags)
        if not name_ar and not name_en:
            continue
            
        gov, dist = determine_governorate_and_district(lat, lon, tags)
        main_cat, sub_cat = categorize_place(tags)
        address = extract_address_details(tags, dist, gov)
        
        phone = tags.get("phone") or tags.get("contact:phone") or tags.get("contact:mobile") or ""
        website = tags.get("website") or tags.get("contact:website") or tags.get("facebook") or ""
        opening_hours = tags.get("opening_hours") or tags.get("service_times") or ""
        
        description = tags.get("description:ar") or tags.get("description") or tags.get("description:en") or ""
        if not description:
            description = f"{sub_cat} في منطقة {dist} - {gov}"
            
        gmaps_url = f"https://www.google.com/maps?q={lat},{lon}"
        
        places.append({
            "name_ar": name_ar,
            "name_en": name_en,
            "governorate": gov,
            "district": dist,
            "main_category": main_cat,
            "sub_category": sub_cat,
            "address": address,
            "latitude": lat,
            "longitude": lon,
            "phone": phone,
            "website": website,
            "opening_hours": opening_hours,
            "description": description,
            "gmaps_url": gmaps_url
        })
        
    print(f"Processed total unique named places: {len(places)}")
    return places

if __name__ == "__main__":
    places = build_dataset()
    with open("scripts/processed_places.json", "w", encoding="utf-8") as f:
        json.dump(places, f, ensure_ascii=False, indent=2)
    print("Saved processed places to scripts/processed_places.json")
