import random
from build_assets_map import photo_collections, gov_cities

def get_food_100():
    # 100 Food and Drinks places
    places = []
    # Seed top Egyptian restaurant chains & iconic local establishments across Egypt
    food_seeds = [
        ("مطعم بلبع للمشويات والأسماك", "Balbaa Village for Grills & Seafood", "مطاعم, أسماك ومأكولات بحرية, مشويات", "سيدي جابر", "طريق الجيش، سيدي جابر، الإسكندرية", 31.2215, 29.9392, "الإسكندرية", "16941", "https://balbaavillage.com", "مطعم أسماك ومشويات", "bx-restaurant"),
        ("مطعم قصر الكبابجي", "Kasr El Kababgi Restaurant", "مطاعم, مشويات", "التجمع الخامس", "شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة", 30.0345, 31.4721, "القاهرة", "16901", "https://kasrelkababgi.com", "مطعم مشويات فاخر", "bx-restaurant"),
        ("مطعم كشري أبو طارق", "Koshary Abou Tarek", "مطاعم, فاست فود", "وسط البلد", "16 شارع معروف، وسط البلد، القاهرة", 30.0528, 31.2389, "القاهرة", "16005", "https://aboutarek.com", "مطعم كشري مصري", "bx-cheese"),
        ("كافيه فرشة شرم الشيخ", "Farsha Mountain Lounge Sharm", "كافيهات, مشروبات وعصائر", "هضبة أم السيد", "هضبة أم السيد، شاطئ الفنار، شرم الشيخ", 27.8489, 34.3168, "جنوب سيناء", "0693660500", "https://instagram.com/farshasharm", "كافيه ولاونج جبلي", "bx-coffee"),
        ("مطعم فارس للمأكولات البحرية", "Fares Seafood Restaurant", "مطاعم, أسماك ومأكولات بحرية", "السوق القديم", "السوق التجاري القديم، شرم الشيخ", 27.8682, 34.2954, "جنوب سيناء", "19973", "https://faresseafood.com", "مطعم أسماك وبحريات", "bx-restaurant"),
        ("مطعم الميناء للأسماك الغردقة", "El Mina Seafood Hurghada", "مطاعم, أسماك ومأكولات بحرية", "السقالة", "شارع الميناء، السقالة، الغردقة", 27.2248, 33.8415, "البحر الأحمر", "0653443650", "https://elminaseafood.com", "مطعم مأكولات بحرية", "bx-restaurant"),
        ("مطعم ذا كلوب هاوس الجونة", "The Clubhouse El Gouna", "مطاعم, كافيهات", "كفر الجونة", "كفر الجونة، وسط البلد، الجونة", 27.3948, 33.6782, "البحر الأحمر", "0653580100", "https://elgouna.com", "مطعم ولاونج سياحي", "bx-restaurant"),
        ("كافيه ومطعم سيكويا الزمالك", "The Smokery Lounge Zamalek", "مطاعم, كافيهات", "الزمالك", "53 شارع أبو الفدا، الزمالك، القاهرة", 30.0689, 31.2185, "القاهرة", "16885", "https://thesmokeryegypt.com", "مطعم عالمي ونايل لاونج", "bx-restaurant"),
        ("مطعم قدورة للأسماك", "Ghadoura Fish Restaurant", "مطاعم, أسماك ومأكولات بحرية", "بحري", "شارع 26 يوليو، بحري، الإسكندرية", 31.2088, 29.8895, "الإسكندرية", "034800405", "https://ghadoura.com", "مطعم أسماك بحري", "bx-restaurant"),
        ("كافيه ديليس محطة الرمل", "Café Delice Alexandria", "كافيهات, مخابز وحلويات", "محطة الرمل", "ميدان سعد زغلول، محطة الرمل، الإسكندرية", 31.2001, 29.8998, "الإسكندرية", "034865666", "https://delice-alex.com", "كافيه ومخبز حلويات فاخر", "bx-coffee"),
        ("كبدة الفلاح", "Kebdet El Fallah", "مطاعم, فاست فود", "محطة الرمل", "شارع صفية زغلول، محطة الرمل، الإسكندرية", 31.1989, 29.9015, "الإسكندرية", "034873330", "https://facebook.com/KebdetElFallah", "مطعم كبدة إسكندراني", "bx-cheese"),
        ("مطعم حسني للمشويات المنصورة", "Hosny Restaurant Mansoura", "مطاعم, مشويات", "المشاية السفلية", "شارع المشاية السفلية، المنصورة", 31.0423, 31.3654, "الدقهلية", "19401", "https://facebook.com/HosnyMansoura", "مطعم مشويات شرقية", "bx-restaurant"),
        ("حلواني كاستلو طنطا", "Castello Patisserie Tanta", "مخابز وحلويات, كافيهات", "شارع الجيش", "تقاطع شارع الجيش والنحاس، طنطا", 30.7895, 31.0024, "الغربية", "0403348888", "https://facebook.com/CastelloTanta", "محل حلويات وتورتات", "bx-cookie"),
        ("مطعم كاستن للأسماك بورسعيد", "Kasten Seafood Port Said", "مطاعم, أسماك ومأكولات بحرية", "طرح البحر", "شارع طرح البحر، بورسعيد", 31.2654, 32.3082, "بورسعيد", "0663248888", "https://facebook.com/KastenSeafood", "مطعم أسماك بورسعيدي", "bx-restaurant"),
        ("مطعم الدكة النوبي أسوان", "El Dokka Nubian Restaurant", "مطاعم", "جزيرة إلفنتين", "جزيرة إلفنتين، وسط النيل، أسوان", 24.0912, 32.8874, "أسوان", "0972316444", "https://facebook.com/ElDokkaAswan", "مطعم نوبي نهري", "bx-restaurant"),
        ("مطعم 1886 التاريخي وينتر بالاس", "1886 Restaurant Winter Palace", "مطاعم, كافيهات", "كورنيش النيل", "فندق وينتر بالاس، الأقصر", 25.6989, 32.6375, "الأقصر", "0952380422", "https://all.accor.com", "مطعم فرنسي فاخر", "bx-restaurant"),
        ("مطعم البرنس إمبابة", "El Prince Restaurant", "مطاعم, مشويات", "إمبابة", "شارع طلعت حرب، إمبابة، الجيزة", 30.0754, 31.2112, "الجيزة", "19277", "https://facebook.com/ElprinceRestaurant", "مطعم طواجن وكبدة", "bx-restaurant"),
        ("مطعم صبحي كابر", "Sobhy Kaber Restaurant", "مطاعم, مشويات", "شبرا", "شارع عبيد، روض الفرج، شبرا، القاهرة", 30.0812, 31.2456, "القاهرة", "16640", "https://sobhykaber.com", "مطعم مشويات ومأكولات شرقية", "bx-restaurant"),
        ("حلواني العبد", "El Abd Sweets", "مخابز وحلويات", "وسط البلد", "25 شارع طلعت حرب، وسط البلد، القاهرة", 30.0489, 31.2401, "القاهرة", "16836", "https://elabdsweets.com", "حلواني ومخبز عريق", "bx-cookie"),
        ("مطعم زوبا الزمالك", "Zooba Restaurant Zamalek", "مطاعم, فاست فود", "الزمالك", "26 شارع 26 يوليو، الزمالك، القاهرة", 30.0612, 31.2201, "القاهرة", "16088", "https://zoobaeats.com", "مطعم مأكولات مصرية عصرية", "bx-restaurant")
    ]
    
    chain_names = [
        ("مطعم روستو للمأكولات السورية", "Rosto Syrian Restaurant", "مطاعم, فاست فود", "مطعم شاورما ومأكولات سورية", "bx-restaurant"),
        ("مطعم شاورما الريم", "Shawarma El Reem", "مطاعم, فاست فود", "مطعم شاورما ومشاوي", "bx-cheese"),
        ("مطعم كبابجي عنتر", "Antar Kababji", "مطاعم, مشويات", "مطعم كباب ومشويات", "bx-restaurant"),
        ("مطعم بازوكا فرايد تشيكن", "Bazooka Fried Chicken", "مطاعم, فاست فود", "مطعم دجاج مقلي كريسبي", "bx-cheese"),
        ("مطعم هارت أتاك برجر", "Heart Attack Burger", "مطاعم, فاست فود", "مطعم برجر وفرايد تشيكن", "bx-cheese"),
        ("مطعم بافلو برجر", "Buffalo Burger", "مطاعم, فاست فود", "مطعم برجر لحم طبيعي", "bx-cheese"),
        ("مطعم حواوشي الرفاعي", "El Refaey Hawawshi", "مطاعم, فاست فود", "مطعم حواوشي مصري أصيل", "bx-cheese"),
        ("كافيه كوستا كوفي", "Costa Coffee", "كافيهات, مشروبات وعصائر", "كافيه ومشروبات ساخنة وباردة", "bx-coffee"),
        ("كافيه ستاربكس", "Starbucks Coffee", "كافيهات, مشروبات وعصائر", "كافيه عالمي ومخبوزات", "bx-coffee"),
        ("كافيه بينوس", "Beano's Cafe", "كافيهات, مخابز وحلويات", "كافيه وجلسات هادئة", "bx-coffee"),
        ("كافيه ومطعم تريانون", "Trianon Cafe", "كافيهات, مخابز وحلويات", "كافيه وصالون شاي عريق", "bx-coffee"),
        ("حلواني تسيباس", "Tseppas Sweets", "مخابز وحلويات", "حلواني وتورتات فاخرة", "bx-cookie"),
        ("حلواني ساليه سوكريه", "Salé Sucré Pâtisserie", "مخابز وحلويات", "حلواني فرنسي وشوكولاتة", "bx-cookie"),
        ("حلواني إيتوال", "Etoile Patisserie", "مخابز وحلويات", "حلواني حلويات شرقية وغربية", "bx-cookie"),
        ("حلواني نولا كب كيك", "NOLA Cupcakes", "مخابز وحلويات", "مخبز كب كيك وحلويات عصرية", "bx-cookie"),
        ("مطعم طأطأ للأسماك", "Ta2ta2 Seafood Restaurant", "مطاعم, أسماك ومأكولات بحرية", "مطعم أسماك وطواجن بحرية", "bx-restaurant"),
        ("مطعم عم بشندي", "Bashandy Restaurant", "مطاعم, فاست فود", "مطعم فول وفلافل وشعبيات", "bx-cheese"),
        ("مطعم جاد للمأكولات", "Gad Restaurant", "مطاعم, فاست فود", "مطعم فطائر ومأكولات شرقية", "bx-restaurant"),
        ("مطعم شبرواوي", "Shabrawy Restaurant", "مطاعم, فاست فود", "مطعم فطار وساندوتشات مصرية", "bx-cheese"),
        ("مطعم الدهان للمشويات", "El Dahan Grill", "مطاعم, مشويات", "مطعم كباب وكفتة تاريخي", "bx-restaurant")
    ]
    
    # Fill up to 100
    for item in food_seeds:
        n_ar, n_en, subs, city, addr, lat, lon, gov, phone, web, ptype, icon = item
        img_cov = photo_collections["food"]["cover"][len(places) % len(photo_collections["food"]["cover"])]
        places.append({
            "name": n_ar, "name_en": n_en, "category": "أكل ومشروبات", "sub_categories": subs,
            "city": city, "full_address": addr, "google_maps_url": f"https://maps.google.com/?q={lat},{lon}",
            "governorate": gov, "phones": phone, "wh_sun": "10:00 ص - 01:00 ص", "wh_mon": "10:00 ص - 01:00 ص",
            "wh_tue": "10:00 ص - 01:00 ص", "wh_wed": "10:00 ص - 01:00 ص", "wh_thu": "10:00 ص - 02:00 ص",
            "wh_fri": "01:00 م - 02:00 ص", "wh_sat": "10:00 ص - 01:00 ص", "working_hours": "",
            "features": "يقبل الدفع بالبطاقات الائتمانية, شبكة واي فاي مجانية, أماكن عائلية وكابلز, مناسب للمجموعات",
            "lat": lat, "lon": lon, "short_desc": f"{ptype} مميز في {city} - {gov}",
            "detailed_desc": f"{n_ar} ({n_en}) - من أرقى وأشهر الوجهات لتناول أشهى الوجبات في {city} بمحافظة {gov}.",
            "image_url": img_cov, "menu_images": photo_collections["food"]["menu"], "website": web,
            "services": "دفع بالفيزا, توصيل طلبات, ساحة انتظار, تيك أواي", "place_type": ptype, "icon": icon
        })

    # Add places across all governorates of Egypt
    gov_keys = list(gov_cities.keys())
    idx = 0
    while len(places) < 100:
        gov = gov_keys[idx % len(gov_keys)]
        city = gov_cities[gov][(idx // len(gov_keys)) % len(gov_cities[gov])]
        chain_ar, chain_en, subs, ptype, icon = chain_names[idx % len(chain_names)]
        
        name_ar = f"{chain_ar} - فرع {city}"
        name_en = f"{chain_en} - {city} Branch"
        lat = round(24.0 + (idx * 0.07) % 7.3, 4)
        lon = round(29.5 + (idx * 0.05) % 4.5, 4)
        phone = f"19{idx+100:03d}" if idx % 2 == 0 else f"0{idx%9+1}{idx*11111:08d}"[:11]
        
        img_cov = photo_collections["food"]["cover"][len(places) % len(photo_collections["food"]["cover"])]
        places.append({
            "name": name_ar, "name_en": name_en, "category": "أكل ومشروبات", "sub_categories": subs,
            "city": city, "full_address": f"الشارع الرئيسي، منطقة {city}، محافظة {gov}",
            "google_maps_url": f"https://maps.google.com/?q={lat},{lon}",
            "governorate": gov, "phones": phone, "wh_sun": "09:00 ص - 01:00 ص", "wh_mon": "09:00 ص - 01:00 ص",
            "wh_tue": "09:00 ص - 01:00 ص", "wh_wed": "09:00 ص - 01:00 ص", "wh_thu": "09:00 ص - 02:00 ص",
            "wh_fri": "01:00 م - 02:00 ص", "wh_sat": "09:00 ص - 01:00 ص", "working_hours": "",
            "features": "شبكة واي فاي مجانية, يقبل الدفع بالبطاقات الائتمانية, مناسب للعائلات",
            "lat": lat, "lon": lon, "short_desc": f"{ptype} في {city} - {gov}",
            "detailed_desc": f"{name_ar} يقدم تشكيلة متميزة وخدمة عالية الجودة لسكان ورواد منطقة {city}.",
            "image_url": img_cov, "menu_images": photo_collections["food"]["menu"],
            "website": f"https://{chain_en.lower().replace(' ', '').replace('-', '')}.com",
            "services": "دفع بالفيزا, توصيل طلبات, ساحة انتظار, تيك أواي",
            "place_type": ptype, "icon": icon
        })
        idx += 1

    return places[:100]


def generate_generic_category(category_name, sub_cats_str, primary_icon, place_type_label, photo_key, famous_names, service_default, feat_default, wh_247=False):
    places = []
    gov_keys = list(gov_cities.keys())
    
    wh_val = "24/7" if wh_247 else "08:30 ص - 10:00 م"
    wh_fri = "24/7" if wh_247 else "01:00 م - 10:00 م"
    
    for i in range(100):
        name_template = famous_names[i % len(famous_names)]
        gov = gov_keys[i % len(gov_keys)]
        city = gov_cities[gov][(i // len(gov_keys)) % len(gov_cities[gov])]
        
        ar_base, en_base, sub_cat, p_type, icon_val = name_template
        
        name_ar = f"{ar_base} ({city})" if i >= len(famous_names) else ar_base
        name_en = f"{en_base} - {city}" if i >= len(famous_names) else en_base
        
        lat = round(24.0 + (i * 0.073) % 7.2, 4)
        lon = round(29.8 + (i * 0.049) % 4.1, 4)
        phone = f"16{i+100:03d}" if i % 3 == 0 else f"0{i%9+1}{i*12345:08d}"[:11]
        
        cov_imgs = photo_collections.get(photo_key, photo_collections["health"])["cover"]
        img_cov = cov_imgs[i % len(cov_imgs)]
        img_menu = photo_collections.get(photo_key, photo_collections["health"])["menu"]
        
        places.append({
            "name": name_ar,
            "name_en": name_en,
            "category": category_name,
            "sub_categories": sub_cat or sub_cats_str,
            "city": city,
            "full_address": f"شارع الجمهورية الرئيسي، منطقة {city}، محافظة {gov}",
            "google_maps_url": f"https://maps.google.com/?q={lat},{lon}",
            "governorate": gov,
            "phones": phone,
            "wh_sun": wh_val, "wh_mon": wh_val, "wh_tue": wh_val, "wh_wed": wh_val,
            "wh_thu": wh_val, "wh_fri": wh_fri, "wh_sat": wh_val,
            "working_hours": "",
            "features": feat_default,
            "lat": lat, "lon": lon,
            "short_desc": f"{p_type or place_type_label} معتمد ورائد في {city} - {gov}",
            "detailed_desc": f"{name_ar} ({name_en}) صرح رائد يقدم أفضل خدمات {category_name} في منطقة {city} بمحافظة {gov}.",
            "image_url": img_cov,
            "menu_images": img_menu,
            "website": f"https://{en_base.lower().replace(' ', '').replace('-', '')[:15]}.com.eg",
            "services": service_default,
            "place_type": p_type or place_type_label,
            "icon": icon_val or primary_icon
        })
    return places


def get_health_100():
    seeds = [
        ("مستشفى السلام الدولي", "As-Salam International Hospital", "مستشفيات", "مستشفى دولي تخصصي", "bx-plus-medical"),
        ("مستشفى دار الفؤاد", "Dar Al Fouad Hospital", "مستشفيات", "مستشفى جراحة القلب والأورام", "bx-plus-medical"),
        ("مستشفى 57357 لعلاج سرطان الأطفال", "Children's Cancer Hospital 57357", "مستشفيات", "مستشفى أورام الأطفال التخصصي", "bx-plus-medical"),
        ("مستشفى كليوباترا", "Cleopatra Hospital", "مستشفيات", "مستشفى تخصصي عام", "bx-plus-medical"),
        ("مستشفى وادي النيل", "Wadi El Neel Hospital", "مستشفيات", "مستشفى وصرح طبي متكامل", "bx-plus-medical"),
        ("مستشفى السعودي الألماني", "Saudi German Hospital Cairo", "مستشفيات", "مستشفى دولي متعدد التخصصات", "bx-plus-medical"),
        ("مستشفى الجونة الدولي", "El Gouna International Hospital", "مستشفيات", "مستشفى سياحي تخصصي", "bx-plus-medical"),
        ("مستشفى الأندلسية الإسكندرية", "Andalusia Hospital Smouha", "مستشفيات", "مستشفى تخصصي", "bx-plus-medical"),
        ("مستشفى القصر العيني التعليمي الجديد", "Kasr Al Ainy French Hospital", "مستشفيات", "مستشفى جامعي تعليمي", "bx-plus-medical"),
        ("مستشفى شفا الأورمان بالأقصر", "Shefa Al Orman Hospital Luxor", "مستشفيات", "صرح علاج الأورام بصعيد مصر", "bx-plus-medical"),
        ("مركز مجدي يعقوب لأمراض وأبحاث القلب أسوان", "Magdi Yacoub Heart Foundation Aswan", "مستشفيات, مراكز طبية", "صرح عالمي لجراحات القلب", "bx-plus-medical"),
        ("مستشفى المنصورة الدولي", "Mansoura International Hospital", "مستشفيات", "مستشفى تخصصي وطوارئ", "bx-plus-medical"),
        ("معامل البرج للتحاليل الطبية", "Al Borg Medical Laboratories", "معامل تحاليل", "معمل تحاليل طبية معتمد", "bx-test-tube"),
        ("معامل المختبر للتحاليل", "Al Mokhtabar Medical Labs", "معامل تحاليل", "معمل تحاليل طبية مرجعي", "bx-test-tube"),
        ("صيدليات العزبي", "El Ezaby Pharmacy", "صيدليات", "صيدلية كبرى وخدمة 24 ساعة", "bx-capsule"),
        ("صيدليات 19011", "19011 Pharmacies", "صيدليات", "صيدلية وخدمة دوائية متكاملة", "bx-capsule"),
        ("صيدليات مصر", "Misr Pharmacies", "صيدليات", "صيدلية ومستحضرات تجميل", "bx-capsule"),
        ("صيدليات سيف", "Seif Pharmacies", "صيدليات", "صيدلية وخدمة توصيل سريع", "bx-capsule"),
        ("مستشفى الدكتور سليمان الحبيب", "Dr. Sulaiman Al Habib Hospital", "مستشفيات", "مستشفى تخصصي راقي", "bx-plus-medical"),
        ("مستشفى عين شمس التخصصي", "Ain Shams Specialized Hospital", "مستشفيات", "مستشفى جامعي تخصصي", "bx-plus-medical")
    ]
    return generate_generic_category(
        "صحة", "مستشفيات, عيادات, صيدليات, معامل تحاليل", "bx-plus-medical", "مستشفى ومركز طبي", "health",
        seeds, "طوارئ 24 ساعة, رعاية مركزة, دفع بالفيزا, ساحة انتظار, حجز عيادات",
        "مداخل سهلة للكراسي المتحركة, مرافق مريحة للزوار, رعاية طبية متطورة, صيدلية داخلية", wh_247=True
    )


def get_shopping_100():
    seeds = [
        ("مول كايرو فيستيفال سيتي", "Cairo Festival City Mall", "مولات", "مول تجاري وترفيهي عالمي", "bx-store-alt"),
        ("مول سيتي ستارز هليوبوليس", "Citystars Mall Heliopolis", "مولات", "مجمع تجاري وسينمات وماركات", "bx-store-alt"),
        ("مول العرب 6 أكتوبر", "Mall of Arabia 6th of October", "مولات", "أكبر مركز تسوق وتجاري", "bx-store-alt"),
        ("مول مصر الشيخ زايد", "Mall of Egypt", "مولات", "مول تسوق ومدينة سكي مصر الثلجية", "bx-store-alt"),
        ("سيتي سنتر ألماظة", "City Centre Almaza", "مولات", "مول تجاري وسينمات فوكس", "bx-store-alt"),
        ("سيتي سنتر الإسكندرية", "City Centre Alexandria", "مولات", "أكبر مول تجاري بالإسكندرية", "bx-store-alt"),
        ("مول صن سيتي شيراتون", "Sun City Mall", "مولات", "مول تجاري وترفيهي", "bx-store-alt"),
        ("مول كارفور المعادي", "Carrefour Maadi City Center", "سوبر ماركت, مولات", "هايبر ماركت ومجمع محلات", "bx-cart"),
        ("هايبر وان الشيخ زايد", "Hyper One Sheikh Zayed", "سوبر ماركت, هايبرماركت", "أكبر هايبر ماركت للتسوق الغذائي", "bx-cart"),
        ("هايبر وان العاشر من رمضان", "Hyper One 10th of Ramadan", "سوبر ماركت, هايبرماركت", "صرح تجاري متكامل للتسوق", "bx-cart"),
        ("سلسلة كارفور هايبر ماركت", "Carrefour Hypermarket Egypt", "سوبر ماركت", "هايبر ماركت ومنتجات منزلية", "bx-cart"),
        ("سلسلة لولو هايبر ماركت", "LuLu Hypermarket Egypt", "سوبر ماركت, هايبرماركت", "هايبر ماركت دولي للمواد الغذائية", "bx-cart"),
        ("مول أركان بلازا الشيخ زايد", "Arkan Plaza Zayed", "مولات, كافيهات", "مجمع تجاري ومطاعم فاخرة", "bx-store-alt"),
        ("أوبن إير مول مدينتي", "Open Air Mall Madinaty", "مولات", "مول مفتوح وسينمات وبحيرات", "bx-store-alt"),
        ("مول بوينت 90 التجمع الخامس", "Point 90 Mall", "مولات", "مول تسوق وترفيه وسينما", "bx-store-alt"),
        ("سينزو مول الغردقة", "Senzo Mall Hurghada", "مولات", "أشهر وأكبر مول تجاري في البحر الأحمر", "bx-store-alt"),
        ("سيتي سنتر شرم الشيخ", "City Centre Sharm El Sheikh", "مولات", "مول تجاري وماركات سياحية", "bx-store-alt"),
        ("مول العروبة طنطا", "Orouba Mall Tanta", "مولات", "أكبر مجمع تجاري بالدلتا والغربية", "bx-store-alt"),
        ("مول الجامعة المنصورة", "Mansoura University Mall", "مولات", "مول تجاري وتسوق للماركات", "bx-store-alt"),
        ("داون تاون مول بورسعيد", "Downtown Mall Port Said", "مولات", "مول ومحلات تسوق وترفيه", "bx-store-alt")
    ]
    return generate_generic_category(
        "تسوق", "مولات, سوبر ماركت, ملابس, إلكترونيات", "bx-store-alt", "مول ومركز تسوق", "shopping",
        seeds, "دفع بالفيزا, ساحة انتظار كبرى Valet, تكييف مركزي, صالات سينما, منطقة ألعاب أطفال",
        "مداخل سهلة للكراسي المتحركة, مرافق مريحة للزوار, شبكة واي فاي مجانية, مناسب للعائلات", wh_247=False
    )


def get_hotels_100():
    seeds = [
        ("فندق ماريوت مينا هاوس الأهرامات", "Marriott Mena House Cairo", "فنادق", "فندق 5 نجوم تاريخي بإطلالة الأهرامات", "bx-hotel"),
        ("فندق فورسيزونز نايل بلازا جاردن سيتي", "Four Seasons Hotel Cairo at Nile Plaza", "فنادق", "فندق 5 نجوم فاخر على النيل", "bx-hotel"),
        ("فندق النيل ريتز كارلتون التحرير", "The Nile Ritz-Carlton Cairo", "فنادق", "فندق 5 نجوم فاخر بميدان التحرير", "bx-hotel"),
        ("فندق سوفيتيل ليجند وينتر بالاس الأقصر", "Sofitel Legend Winter Palace Luxor", "فنادق", "قصر فندقي تاريخي ملوكي على النيل", "bx-hotel"),
        ("فندق سوفيتيل ليجند أولد كتراكت أسوان", "Sofitel Legend Old Cataract Aswan", "فنادق", "أسطورة الفنادق التاريخية العالمية بأسوان", "bx-hotel"),
        ("فندق سيسيل الإسكندرية (شتيجنبرجر)", "Steigenberger Cecil Hotel Alexandria", "فنادق", "فندق تاريخي كلاسيكي بمحطة الرمل", "bx-hotel"),
        ("منتجع ريكسوس بريميوم سيجيت شرم الشيخ", "Rixos Premium Seagate Sharm", "فنادق, منتجعات", "منتجع 5 نجوم أول إنكلوسيف فاخر", "bx-hotel"),
        ("منتجع فورسيزونز شرم الشيخ", "Four Seasons Resort Sharm El Sheikh", "فنادق, منتجعات", "منتجع وفيلات شاطئية فائقة الفخامة", "bx-hotel"),
        ("فندق ذا شيدي الجونة", "The Chedi El Gouna", "فنادق, منتجعات", "منتجع 5 نجوم بيئي فاخر على الشاطئ", "bx-hotel"),
        ("منتجع أوبروي سهل حشيش", "The Oberoi Beach Resort Sahl Hasheesh", "فنادق, منتجعات", "أجنحة فاخرة على شاطئ البحر الأحمر", "bx-hotel"),
        ("فندق سانت ريجيس القاهرة", "The St. Regis Cairo", "فنادق", "فندق 5 نجوم فاخر بإطلالة النيل الخالد", "bx-hotel"),
        ("فندق كيمبنسكي النيل جاردن سيتي", "Kempinski Nile Hotel Cairo", "فنادق", "فندق بوتيك 5 نجوم على كورنيش النيل", "bx-hotel"),
        ("فندق هيلتون الإسكندرية كينجز رانش", "Hilton Alexandria King's Ranch", "فنادق", "فندق ومنتجع سبا فاخر بالساحل", "bx-hotel"),
        ("فندق راديسون بلو الإسكندرية", "Radisson Blu Hotel Alexandria", "فنادق", "فندق وقاعات مؤتمرات دولية", "bx-hotel"),
        ("فندق هلنان فلسطين المنتزه", "Helnan Palestine Hotel Alexandria", "فنادق", "فندق 5 نجوم داخل حدائق قصر المنتزه", "bx-hotel"),
        ("منتجع موفنبيك أسوان", "Mövenpick Resort Aswan", "فنادق", "منتجع جزيرة إلفنتين وسط نيل أسوان", "bx-hotel"),
        ("فندق شتايجنبرجر نايل بالاس الأقصر", "Steigenberger Nile Palace Luxor", "فنادق", "فندق 5 نجوم بإطلالة ضفاف النيل", "bx-hotel"),
        ("منتجع جاز ميرابل شرم الشيخ", "Jaz Mirabel Resort Sharm", "فنادق, منتجعات", "منتجع وألعاب مائية متكاملة", "bx-hotel"),
        ("فندق شتيجنبرجر الداو بيتش الغردقة", "Steigenberger ALDAU Beach Hotel", "فنادق, منتجعات", "منتجع شاطئي وجولف وأكوا بارك", "bx-hotel"),
        ("فندق توليب الفرسان الإسماعيلية", "Tolip El Forsan Hotel Ismailia", "فنادق", "فندق 5 نجوم بإطلالة بحيرة التمساح", "bx-hotel")
    ]
    return generate_generic_category(
        "إقامة وسياحة", "فنادق, منتجعات, شقق فندقية", "bx-hotel", "فندق ومنتجع سياحي", "hotels",
        seeds, "استقبال 24 ساعة, حمامات سباحة, مطاعم وبوفيه مفتوح, سبا ونادي صحي, خدمة غرف VIP, شاطئ خاص",
        "شبكة واي فاي مجانية, إطلالة ساحرة, مرافق مريحة للزوار, يقبل الدفع بالبطاقات الائتمانية", wh_247=True
    )


def get_entertainment_100():
    seeds = [
        ("المتحف المصري الكبير (GEM)", "Grand Egyptian Museum", "متاحف", "أكبر متحف أثري حضاري في العالم", "bx-mask"),
        ("متحف الحضارة المصرية بالفسطاط (NMEC)", "National Museum of Egyptian Civilization", "متاحف", "متحف المومياوات الملكية والحضارة المصرية", "bx-mask"),
        ("المتحف المصري بالتحرير", "The Egyptian Museum Tahrir", "متاحف", "أعرق متحف للآثار الفرعونية في العالم", "bx-mask"),
        ("بانوراما قلعة صلاح الدين الأيوبي", "Citadel of Saladin Cairo", "معالم أثرية, متاحف", "القلعة التاريخية وجامع محمد علي", "bx-buildings"),
        ("برج القاهرة السياحي", "Cairo Tower", "معالم سياحية", "أعلى قمة وإطلالة بانورامية 360 درجة على العاصمة", "bx-buildings"),
        ("متحف مكتبة الإسكندرية والبلانيتيريوم", "Bibliotheca Alexandrina Museums", "متاحف, معارض", "صرح المعرفة والمتاحف والقبة السماوية", "bx-mask"),
        ("قلعة قايتباي بالإسكندرية", "Citadel of Qaitbay Alexandria", "معالم أثرية", "القلعة البحرية التاريخية بموقع منار الإسكندرية", "bx-buildings"),
        ("متحف الأقصر للفن المصري القديم", "Luxor Museum", "متاحف", "أروع كنوز الآثار الفرعونية في طيبة القديمة", "bx-mask"),
        ("متحف التحنيط بالأقصر", "Mummification Museum Luxor", "متاحف", "المتحف الفريد لأسرار التحنيط الفرعوني", "bx-mask"),
        ("متحف النوبة بأسوان", "Nubian Museum Aswan", "متاحف", "حارس تراث وحضارة بلاد الذهب والنوبة", "bx-mask"),
        ("دار الأوبرا المصرية بالجزيرة", "Cairo Opera House", "مسارح, فعاليات", "الصرح الثقافي والفني الأول في الشرق الأوسط", "bx-mask"),
        ("مدينة الإنتاج الإعلامي وماجيك لاند", "Magic Land & Media Production City", "ملاهي, ترفيه", "مدينة الألعاب والإنتاج السينمائي 6 أكتوبر", "bx-laugh"),
        ("أكوا بارك طريق مصر إسماعيلية", "Aqua Park Cairo", "أكوا بارك, ترفيه", "أكبر مدينة ألعاب مائية عائلية في مصر", "bx-swim"),
        ("ملاهي دريم بارك 6 أكتوبر", "Dream Park 6th of October", "ملاهي, ترفيه", "أشهر وأكبر مدينة ملاهي ترفيهية في مصر", "bx-laugh"),
        ("سكي مصر (مدينة التزلج الجليدية)", "Ski Egypt Mall of Egypt", "ترفيه, ملاهي", "أكبر حديقة ثلجية وتزلج على الجليد بالشرق الأوسط", "bx-swim"),
        ("سينما فوكس مول مصر (VOX Cinemas)", "VOX Cinemas Mall of Egypt", "سينما", "أحدث صالات العرض السينمائي IMAX و4DX", "bx-film"),
        ("سينما آيماكس بلازا الشيخ زايد", "IMAX Cinema Plaza Zayed", "سينما", "شاشات عرض عملاقة وتقنية IMAX ثلاثية الأبعاد", "bx-film"),
        ("متحف الأحياء المائية بالإسكندرية", "Alexandria Aquarium", "متاحف, ترفيه", "عالم الكائنات والمخلوقات البحرية بالأنفوشي", "bx-mask"),
        ("جراند أكواريوم الغردقة", "Hurghada Grand Aquarium", "ترفيه, متاحف", "أكبر حديقة حيوان مائية ونفق قروش بالبحر الأحمر", "bx-mask"),
        ("مدينة ألف ليلة وليلة شرم الشيخ", "Alf Leila Wa Leila Sharm", "ترفيه, مسارح", "عروض الصوت والضوء والفلكلور الشرقي", "bx-mask")
    ]
    return generate_generic_category(
        "ترفيه", "متاحف, ملاهي, سينما, أكوا بارك, مسارح", "bx-mask", "معلم ترفيهي وثقافي", "entertainment",
        seeds, "حجز تذاكر إلكتروني, مرشدين سياحيين, صالات مكيفة, كافيهات ومطاعم, عروض ترفيهية",
        "مناسب للأطفال والعائلات, مداخل للكراسي المتحركة, مرافق مريحة للزوار, شبكة واي فاي", wh_247=False
    )


def get_education_100():
    seeds = [
        ("جامعة القاهرة", "Cairo University", "جامعات", "أم الجامعات وأعرق صرح أكاديمي تأسس 1908", "bx-book-reader"),
        ("جامعة عين شمس", "Ain Shams University", "جامعات", "جامعة حكومية عريقة تضم أرقى كليات الطب والهندسة", "bx-book-reader"),
        ("جامعة الإسكندرية", "Alexandria University", "جامعات", "الصرح الجامعي الرائد في شمال مصر والبحر المتوسط", "bx-book-reader"),
        ("الجامعة الأمريكية بالقاهرة (AUC)", "The American University in Cairo", "جامعات", "أرقى جامعة خاصة دولية في مصر والشرق الأوسط", "bx-book-reader"),
        ("الجامعة الألمانية بالقاهرة (GUC)", "German University in Cairo", "جامعات", "التعليم الألماني الرائد في الهندسة والتكنولوجيا", "bx-book-reader"),
        ("الجامعة البريطانية في مصر (BUE)", "The British University in Egypt", "جامعات", "تعليم بريطاني معتمد في الشروق", "bx-book-reader"),
        ("جامعة المنصورة", "Mansoura University", "جامعات", "عاصمة الطب في مصر ومراكز زراعة الكلى والكبد", "bx-book-reader"),
        ("جامعة أسيوط", "Assiut University", "جامعات", "أقدم وأكبر صرح جامعي في صعيد مصر", "bx-book-reader"),
        ("جامعة طنطا", "Tanta University", "جامعات", "جامعة إقليمية كبرى في قلب الدلتا", "bx-book-reader"),
        ("جامعة الزقازيق", "Zagazig University", "جامعات", "صرح أكاديمي وبحثي متميز في محافظة الشرقية", "bx-book-reader"),
        ("جامعة قناة السويس بالإسماعيلية", "Suez Canal University", "جامعات", "جامعة رائدة في العلوم البحرية والتطبيقية", "bx-book-reader"),
        ("جامعة حلوان", "Helwan University", "جامعات", "جامعة الفنون التطبيقية والجميلة والتربية الرياضية", "bx-book-reader"),
        ("جامعة الأزهر الشريف", "Al-Azhar University", "جامعات", "أقدم جامعة إسلامية وعلمية في العالم", "bx-book-reader"),
        ("جامعة النيل الأهلية", "Nile University", "جامعات", "أول جامعة بحثية تكنولوجية أهلية في مصر", "bx-book-reader"),
        ("جامعة الجلالة الدولية", "Galala University", "جامعات", "جامعة أهلية ذكية على هضبة الجلالة بالسويس", "bx-book-reader"),
        ("جامعة الملك سلمان الدولية بشرم الشيخ", "King Salman International University", "جامعات", "جامعة دولية متطورة بجنوب سيناء", "bx-book-reader"),
        ("جامعة العلمين الدولية", "Alamein International University", "جامعات", "صرح جامعي ذكي بمدينة العلمين الجديدة", "bx-book-reader"),
        ("جامعة بدر بالقاهرة (BUC)", "Badr University in Cairo", "جامعات", "جامعة خاصة متكاملة الكليات الطبية والهندسية", "bx-book-reader"),
        ("جامعة المستقبل (FUE)", "Future University in Egypt", "جامعات", "جامعة رائدة في التجمع الخامس", "bx-book-reader"),
        ("الجامعة المصرية اليابانية للعلوم والتكنولوجيا (E-JUST)", "Egypt-Japan University E-JUST", "جامعات", "التعليم الياباني المتقدم ببرج العرب الإسكندرية", "bx-book-reader")
    ]
    return generate_generic_category(
        "تعليم", "جامعات, مدارس, معاهد عليا, مراكز تدريب", "bx-book-reader", "جامعة وصرح أكاديمي", "education",
        seeds, "شؤون طلاب, مكتبات رقمية مركزية, ملاعب وأنشطة طلابية, مدن جامعية, مراكز تدريب ولغات",
        "شبكة واي فاي تعليمية, معامل متطورة, مداخل للكراسي المتحركة, مرافق مريحة للزوار", wh_247=False
    )


def get_sports_100():
    seeds = [
        ("النادي الأهلي المصري بالجزيرة", "Al Ahly SC Gezira", "نوادي رياضية", "نادي القرن الإفريقي وأعرق الأندية المصرية 1907", "bx-football"),
        ("نادي الزمالك للألعاب الرياضية بميت عقبة", "Zamalek SC Mohandessin", "نوادي رياضية", "صرح البطولات والألعاب الرياضية 1911", "bx-football"),
        ("نادي الجزيرة الرياضي بالزمالك", "Gezira Sporting Club Zamalek", "نوادي رياضية", "أعرق نادي رياضي واجتماعي أرستقراطي في مصر 1882", "bx-football"),
        ("نادي الصيد المصري بالدقي", "Shooting Club Dokki", "نوادي رياضية", "أشهر وأكبر الأندية الرياضية والاجتماعية بمصر", "bx-football"),
        ("نادي سبورتنج الإسكندرية", "Alexandria Sporting Club", "نوادي رياضية", "أعرق أندية الإسكندرية والجولف والفروسية 1890", "bx-football"),
        ("نادي الاتحاد السكندري بالشاطبي", "Al Ittihad Alexandria Club", "نوادي رياضية", "زعيم الثغر ومعشوق الجماهير السكندرية 1914", "bx-football"),
        ("نادي سموحة الرياضي الإسكندرية", "Smouha SC Alexandria", "نوادي رياضية", "أكبر نادي للألعاب الأولمبية والفروسية", "bx-football"),
        ("نادي الإسماعيلي الرياضي (برازيل مصر)", "Ismaily SC Ismailia", "نوادي رياضية", "قلعة الدراويش وأول بطل إفريقي مصري 1921", "bx-football"),
        ("النادي المصري البورسعيدي", "Al Masry SC Port Said", "نوادي رياضية", "نادي الوطنية وقلعة بورسعيد الرياضية 1920", "bx-football"),
        ("نادي وادي دجلة المعادي", "Wadi Degla Club Maadi", "نوادي رياضية", "أكبر سلسلة أندية رياضية وأكاديميات اسكواش", "bx-football"),
        ("نادي هليوبوليس الرياضي بمصر الجديدة", "Heliopolis Sporting Club", "نوادي رياضية", "نادي الألعاب المائية والبطولات الدولية", "bx-football"),
        ("نادي الشمس الرياضي بمصر الجديدة", "El Shams Club", "نوادي رياضية", "أكبر نادي رياضي من حيث المساحة وعدد الأعضاء بمصر", "bx-football"),
        ("ستاد القاهرة الدولي بمدينة نصر", "Cairo International Stadium", "استادات", "الستاد التاريخي الوطني للمنتخب المصري", "bx-football"),
        ("ستاد الجيش المصري ببرج العرب", "Borg El Arab Stadium", "استادات", "أكبر ستاد رياضي في مصر وثاني أكبر ستاد بإفريقيا", "bx-football"),
        ("ستاد مصر بالعاصمة الإدارية الجديدة", "Egypt Stadium Olympic City", "استادات", "أحدث وأكبر تحفة رياضية استيعاب 93 ألف مشجع", "bx-football"),
        ("سلسلة أندية جولدز جيم العالمية", "Gold's Gym Egypt", "جيم", "أشهر سلسلة لياقة بدنية ونادي صحي عالمي", "bx-dumbbell"),
        ("سلسلة أندية سمارت جيم", "Smart Gym Egypt", "جيم", "أحدث أجهزة كمال الأجسام واللياقة والتخسيس", "bx-dumbbell"),
        ("نادي المقاولون العرب بالجبل الأخضر", "Arab Contractors SC", "نوادي رياضية", "صرح البطولات والمسبح الأولمبي والألعاب الرياضية", "bx-football"),
        ("نادي طنطا الرياضي", "Tanta Sporting Club", "نوادي رياضية", "أعرق الأندية الرياضية بمحافظة الغربية والدلتا", "bx-football"),
        ("نادي أسوان الرياضي (تماسيح النيل)", "Aswan SC", "نوادي رياضية", "قلعة الرياضة والشباب في أقصى جنوب مصر", "bx-football")
    ]
    return generate_generic_category(
        "رياضة", "نوادي رياضية, ملاعب, استادات, جيم", "bx-dumbbell", "نادي ومركز رياضي", "sports",
        seeds, "ملاعب كرة قدم وتنس, حمامات سباحة أولمبية, صالات جيم وسبا, أكاديميات ناشئين, صالات عائلات",
        "مدربين معتمدين, مرافق مريحة للزوار, شبكة واي فاي, مواقف سيارات مؤمنة", wh_247=False
    )


def get_finance_100():
    seeds = [
        ("البنك الأهلي المصري (الفرع الرئيسي)", "National Bank of Egypt (NBE)", "بنوك", "بنك أهل مصر وأقدم البنوك الوطنية 1898", "bx-credit-card-front"),
        ("بنك مصر (الفرع الرئيسي بوسط البلد)", "Banque Misr Head Office", "بنوك", "بنك الاقتصاد الوطني ومؤسسه طلعت حرب 1920", "bx-credit-card-front"),
        ("البنك التجاري الدولي (CIB)", "Commercial International Bank CIB", "بنوك", "أكبر بنك قطاع خاص في مصر والخدمات الرقمية", "bx-credit-card-front"),
        ("بنك قطر الوطني الأهلي (QNB)", "QNB Alahli Bank Egypt", "بنوك", "بنك رائد في الخدمات المصرفية الشاملة", "bx-credit-card-front"),
        ("بنك HSBC مصر", "HSBC Bank Egypt", "بنوك", "البنك البريطاني العالمي للخدمات المصرفية الدولية", "bx-credit-card-front"),
        ("بنك الإسكندرية (سان باولو)", "Bank of Alexandria Intesa Sanpaolo", "بنوك", "أعرق البنوك التاريخية والشراكة الإيطالية", "bx-credit-card-front"),
        ("بنك القاهرة (الفرع الرئيسي)", "Banque Du Caire Head Office", "بنوك", "رائد التمويل المتناهي الصغر والخدمات المصرفية", "bx-credit-card-front"),
        ("بنك فيصل الإسلامي المصري", "Faisal Islamic Bank of Egypt", "بنوك", "أول بنك إسلامي وتجاري متكامل في مصر", "bx-credit-card-front"),
        ("بنك أبوظبي الأول مصر (FABMISR)", "FABMISR Bank", "بنوك", "أحد أكبر البنوك الاستثمارية والتجارية بمصر", "bx-credit-card-front"),
        ("بنك كريدي أجريكول مصر", "Crédit Agricole Egypt", "بنوك", "البنك الفرنسي للخدمات المصرفية للأفراد والشركات", "bx-credit-card-front"),
        ("البنك العربي الإفريقي الدولي (AAIB)", "Arab African International Bank", "بنوك", "رائد الخدمات المصرفية الاستثمارية والشركات", "bx-credit-card-front"),
        ("بنك التعمير والإسكان (HDB)", "Housing & Development Bank", "بنوك", "البنك الرائد في التمويل العقاري والمشروعات السكنية", "bx-credit-card-front"),
        ("مصرف أبوظبي الإسلامي (ADIB مصر)", "Abu Dhabi Islamic Bank Egypt", "بنوك", "الخدمات المصرفية المتوافقة مع الشريعة الإسلامية", "bx-credit-card-front"),
        ("البنك العربي (Arab Bank)", "Arab Bank Egypt", "بنوك", "شبكة مصرفية عربية ودولية عريقة", "bx-credit-card-front"),
        ("بنك قناة السويس", "Suez Canal Bank", "بنوك", "بنك تجاري وتمويل كبرى المشروعات القومية", "bx-credit-card-front"),
        ("شركة الأهلي للصرافة", "Al Ahly Exchange Company", "صرافة", "أكبر شركة صرافة لتداول وتغيير العملات الأجنبية", "bx-transfer"),
        ("شركة مصر للصرافة", "Misr Exchange Company", "صرافة", "شركة صرافة وطنية معتمدة من البنك المركزي", "bx-transfer"),
        ("ويسترن يونيون مصر للتحويلات (Western Union)", "Western Union Egypt", "خدمات مالية, تحويل أموال", "الشبكة العالمية الأولى لتحويل واستلام الأموال", "bx-transfer"),
        ("البنك المركزي المصري (CBE)", "Central Bank of Egypt", "بنوك, جهات سيادية", "حارس الاستقرار النقدي والنظام المصرفي بمصر", "bx-credit-card-front"),
        ("البورصة المصرية بالقرية الذكية (EGX)", "The Egyptian Exchange EGX", "خدمات مالية, أسواق مال", "سوق الأوراق المالية وسوق المال المصري", "bx-credit-card-front")
    ]
    return generate_generic_category(
        "خدمات مالية", "بنوك, ماكينات ATM, صرافة, تحويل أموال", "bx-credit-card-front", "بنك ومصرف مالي", "finance",
        seeds, "خدمة عملاء VIP, ماكينات صراف آلي ATM 24 ساعة, تغيير عملات, قروض وتمويل, خزائن أمانات",
        "مداخل مؤمنة للكراسي المتحركة, صالات انتظار مكيفة, شاشات أسعار الصرف, استشارات مالية", wh_247=False
    )


def get_government_100():
    seeds = [
        ("مطار القاهرة الدولي (CAI)", "Cairo International Airport", "مطارات", "البوابة الجوية الأولى لمصر وقارة إفريقيا", "bx-paper-plane"),
        ("مطار برج العرب الدولي بالإسكندرية (HBE)", "Borg El Arab International Airport", "مطارات", "المطار الدولي الرئيسي لعروس البحر المتوسط", "bx-paper-plane"),
        ("مطار شرم الشيخ الدولي (SSH)", "Sharm El Sheikh International Airport", "مطارات", "بوابة السياحة العالمية بجنوب سيناء", "bx-paper-plane"),
        ("مطار الغردقة الدولي (HRG)", "Hurghada International Airport", "مطارات", "المطار الدولي النابض على ساحل البحر الأحمر", "bx-paper-plane"),
        ("مطار سفنكس الدولي بالجيزة (SPX)", "Sphinx International Airport Giza", "مطارات", "مطار غرب القاهرة والأهرامات والمتحف الكبير", "bx-paper-plane"),
        ("مطار الأقصر الدولي (LXR)", "Luxor International Airport", "مطارات", "بوابة السياحة الثقافية والآثار العالمية", "bx-paper-plane"),
        ("مطار أسوان الدولي (ASW)", "Aswan International Airport", "مطارات", "بوابة السحر والنيل والجنوب المصري", "bx-paper-plane"),
        ("محطة قطارات مصر برمسيس (محطة مصر)", "Ramses Railway Station Cairo", "محطات قطار", "المحطة المركزية الكبرى لسكك حديد مصر 1856", "bx-train"),
        ("محطة قطارات سكك حديد مصر بشتيل بالجيزة", "Bashtil Railway Station Giza", "محطات قطار", "أحدث وأضخم محطة قطارات ذكية لخطوط الصعيد", "bx-train"),
        ("محطة قطار سيدي جابر بالإسكندرية", "Sidi Gaber Railway Station", "محطات قطار", "أحدث محطة قطارات ومول تجاري بالإسكندرية", "bx-train"),
        ("محطة قطار محطة مصر بالإسكندرية", "Alexandria Railway Station", "محطات قطار", "المحطة التاريخية النهائية لقطارات الإسكندرية", "bx-train"),
        ("ميناء الإسكندرية البحري", "Alexandria Port Authority", "موانئ", "أقدم وأكبر الموانئ البحرية التجارية في مصر", "bx-ship"),
        ("ميناء بورسعيد وقناة السويس", "Port Said Port & Suez Canal", "موانئ, ملاحة", "المدخل الشمالي للمجرى الملاحي لقناة السويس", "bx-ship"),
        ("مجمع الخدمات الحكومية بالعاصمة الإدارية", "Government District New Capital", "مصالح حكومية", "الحي الحكومي ومقرات الوزارات الذكية بمصر", "bx-buildings"),
        ("مكتب بريد القاهرة الرئيسي التاريخي بالعتبة", "Cairo Central Post Office Ataba", "بريد", "البريد المصري وأقدم مركز للخدمات البريدية والمالية", "bx-envelope"),
        ("مجمع محاكم الجلاء ودار القضاء العالي", "High Court of Justice Cairo", "محاكم", "صرح القضاء والعدالة التاريخي بوسط البلد", "bx-briefcase"),
        ("الهيئة العامة للاستثمار والمناطق الحرة (GAFI)", "General Authority for Investment GAFI", "مصالح حكومية", "مركز خدمات المستثمرين وتأسيس الشركات", "bx-buildings"),
        ("مصلحة الجوازات والهجرة بالعباسية", "Passports and Immigration Authority", "مصالح حكومية", "المقر الرئيسي لإصدار الجوازات وتأشيرات الإقامة", "bx-file"),
        ("سفارة الولايات المتحدة الأمريكية بالقاهرة", "Embassy of the United States Cairo", "سفارات", "المقر الدبلوماسي بحي جاردن سيتي", "bx-buildings"),
        ("سفارة المملكة المتحدة بالقاهرة", "British Embassy Cairo", "سفارات", "المقر الدبلوماسي البريطاني بحي جاردن سيتي", "bx-buildings")
    ]
    return generate_generic_category(
        "خدمات حكومية", "مطارات, محطات قطار, موانئ, مصالح حكومية, بريد, سفارات", "bx-buildings", "مرفق وهيئة حكومية ونقل", "government",
        seeds, "صالات سفر واستقبال, خدمات إلكترونية ذكية, استخراج أوراق رسمية, شباك تذاكر, مواقف سيارات",
        "تسهيلات لذوي الهمم, أمن وحراسة مشددة, صالات انتظار مكيفة, شاشات مواعيد الرحلات", wh_247=False
    )


def get_public_places_100():
    seeds = [
        ("حدائق قصر المنتزه الملكية بالإسكندرية", "Montaza Palace Gardens Alexandria", "حدائق", "أروع وأضخم الحدائق الشاطئية الملكية بمصر", "bx-tree"),
        ("حديقة الأزهر بالقاهرة (Al-Azhar Park)", "Al-Azhar Park Cairo", "حدائق", "الرئة الخضراء وإطلالة بانورامية ساحرة على قلعة صلاح الدين", "bx-tree"),
        ("الحديقة الدولية بمدينة نصر", "International Garden Nasr City", "حدائق", "حديقة عالمية تضم أجنحة ومعالم لدول العالم", "bx-tree"),
        ("حديقة الحيوان بالجيزة التاريخية", "Giza Zoological Garden", "حدائق, ترفيه", "أعرق وأكبر حديقة حيوان تأسست عام 1891", "bx-tree"),
        ("حديقة الأورمان النباتية بالجيزة", "Orman Botanical Garden Giza", "حدائق", "أندر النباتات والأشجار ومعرض الزهور السنوي", "bx-tree"),
        ("حديقة أنطونيادس التاريخية بالإسكندرية", "Antoniadis Garden Alexandria", "حدائق", "أقدم حدائق الإسكندرية والتماثيل والقصور الرخامية", "bx-tree"),
        ("الممشى السياحي لأهل مصر على النيل", "Ahl Masr Promenade Cairo", "حدائق, ممشى سياحي", "أحدث ممشى سياحي ترفيهي بطول نهر النيل", "bx-tree"),
        ("جامع الأزهر الشريف المعمور", "Al-Azhar Mosque", "أماكن دينية, مساجد", "منارة الإسلام والعلوم وقلب القاهرة الفاطمية 972م", "bx-bookmark-heart"),
        ("مسجد الإمام الحسين بالقاهرة القديمة", "Imam Hussein Mosque", "أماكن دينية, مساجد", "المسجد التاريخي المبارك بجوار خان الخليلي", "bx-bookmark-heart"),
        ("مسجد السيدة زينب بالقاهرة", "Sayyida Zeinab Mosque", "أماكن دينية, مساجد", "أشهر المساجد التراثية الروحانية بقلب العاصمة", "bx-bookmark-heart"),
        ("مسجد مصر الكبير والمركز الثقافي الإسلامي", "Grand Mosque of Egypt New Capital", "أماكن دينية, مساجد", "أكبر مجمع ومسجد إسلامي بالعاصمة الإدارية", "bx-bookmark-heart"),
        ("مسجد سيدي المرسي أبو العباس بالإسكندرية", "El Mursi Abu El Abbas Mosque", "أماكن دينية, مساجد", "درة العمارة الأندلسية والميدان الصوفي ببحري", "bx-bookmark-heart"),
        ("مسجد الصحابة التاريخي بشرم الشيخ", "Al Sahaba Mosque Sharm El Sheikh", "أماكن دينية, مساجد", "تحفة العمارة العثمانية بالسوق القديم بشرم الشيخ", "bx-bookmark-heart"),
        ("مسجد سيدي إبراهيم الدسوقي بدسوق", "Ibrahim El Desouky Mosque", "أماكن دينية, مساجد", "المزار الصوفي والتاريخي الشهير بكفر الشيخ", "bx-bookmark-heart"),
        ("مسجد العارف بالله سيدي أحمد البدوي بطنطا", "El Sayed El Badawi Mosque Tanta", "أماكن دينية, مساجد", "المسجد التاريخي ورمز مدينة طنطا والدلتا", "bx-bookmark-heart"),
        ("الكنيسة المعلقة بمصر القديمة", "The Hanging Church (Al-Muallaqa)", "أماكن دينية, كنائس", "أقدم وأعرق كنائس مصر القبطية الأثرية", "bx-bookmark-heart"),
        ("دير القديس أنطونيوس بالبحر الأحمر", "Monastery of Saint Anthony Red Sea", "أماكن دينية, أديرة", "أقدم دير مسيحي في العالم مؤسس الرهبنة", "bx-bookmark-heart"),
        ("دير القديسة كاترين بجنوب سيناء", "Saint Catherine's Monastery Sinai", "أماكن دينية, معالم أثرية", "الدير التاريخي عند جبل موسى وموقع التراث العالمي", "bx-bookmark-heart"),
        ("كاتدرائية ميلاد المسيح بالعاصمة الإدارية", "Nativity of Christ Cathedral", "أماكن دينية, كنائس", "أكبر كاتدرائية مسيحية في الشرق الأوسط وإفريقيا", "bx-bookmark-heart"),
        ("كاتدرائية الكرازة المرقسية بالإسكندرية", "Saint Mark's Coptic Orthodox Cathedral", "أماكن دينية, كنائس", "المقر المرقسي التاريخي الأول لكنيسة الإسكندرية", "bx-bookmark-heart")
    ]
    return generate_generic_category(
        "أماكن عامة", "حدائق, مساجد, كنائس, معالم تراثية, محميات طبيعية", "bx-tree", "معلم عام وتراثي وديني", "public_places",
        seeds, "جولات سياحية وإرشادية, ساحات صلاة واسعة, حدائق خضراء, مناطق استراحة ومقاعد, مواقف سيارات",
        "أجواء روحانية وهادئة, مرافق مريحة للزوار, تسهيلات لذوي الهمم, مساحات مفتوحة", wh_247=False
    )
