import os
import shutil
import json
import openpyxl
from save_category_file import populate_sheet_data, create_single_category_file, base_dir, headers, header_fill, header_font

# Load raw places from OSM to use as base for realistic coordinates, names, phones & addresses
with open("scripts/raw_places.json", "r", encoding="utf-8") as f:
    raw_osm = json.load(f)

print(f"Loaded raw OSM items: {len(raw_osm)}")

# Governorates of Egypt
gov_cities = {
    "القاهرة": ["وسط البلد", "مدينة نصر", "مصر الجديدة", "المعادي", "الزمالك", "التجمع الخامس", "شبرا", "المقطم", "الرحاب", "مدينتي", "الشروق", "حلوان"],
    "الجيزة": ["الدقي", "المهندسين", "الشيخ زايد", "مدينة 6 أكتوبر", "الهرم", "فيصل", "العجوزة", "إمبابة", "حدائق الأهرام", "أكتوبر الجديدة"],
    "الإسكندرية": ["محطة الرمل", "سيدي جابر", "سموحة", "بحري والأنفوشي", "ستانلي", "رشدي", "لوران", "العجمي", "ميامي", "المندرة", "المنتزه", "برج العرب"],
    "البحر الأحمر": ["الغردقة - السقالة", "الغردقة - الممشى السياحي", "الجونة", "سهل حشيش", "سفاجا", "مرسى علم", "القصير"],
    "جنوب سيناء": ["شرم الشيخ - خليج نعمة", "شرم الشيخ - السوق القديم", "شرم الشيخ - هضبة أم السيد", "دهب - الممشى السياحي", "نويبع", "طابا", "رأس سدر"],
    "الدقهلية": ["المنصورة - المشاية", "المنصورة - حي الجامعة", "المنصورة - شارع الجمهورية", "ميت غمر", "طلخا", "السنبلاوين"],
    "الغربية": ["طنطا - شارع الجيش", "طنطا - شارع النحاس", "المحلة الكبرى - شارع البحر", "المحلة الكبرى - شكري القوتلي", "كفر الزيات", "زفتى"],
    "بورسعيد": ["حي الشرق", "طرح البحر", "حي المناخ", "حي العرب", "بورفؤاد", "الممشى الساحلي"],
    "الإسماعيلية": ["حي الإفرنج", "نمرة 6", "شارع السلطان حسين", "طريق البلاجات", "فايد", "القنطرة"],
    "السويس": ["حي السويس", "بور توفيق", "شارع الجيش", "العين السخنة", "عتاقة"],
    "الأقصر": ["كورنيش النيل", "وسط البلد", "البر الغربي", "الكرنك", "طريق المطار"],
    "أسوان": ["كورنيش النيل أسوان", "جزيرة إلفنتين", "وسط البلد", "أبو سمبل", "كوم أمبو", "إدفو"],
    "مطروح": ["مرسى مطروح - الكورنيش", "شارع الإسكندرية", "العلمين الجديدة", "الساحل الشمالي - مارينا", "سيدي عبد الرحمن", "سيوة"],
    "دمياط": ["دمياط - شارع الجلاء", "رأس البر - شارع النيل", "دمياط الجديدة", "كفر سعد"],
    "الفيوم": ["الفيوم - وسط البلد", "بحيرة قارون", "وادي الريان", "قرية تونس", "سنورس"],
    "بني سويف": ["كورنيش النيل بني سويف", "شارع بورسعيد", "بني سويف الجديدة", "الواسطى"],
    "المنيا": ["كورنيش النيل المنيا", "شارع طه حسين", "المنيا الجديدة", "ملوي"],
    "أسيوط": ["أسيوط - شارع الجمهورية", "حي شرق", "أسيوط الجديدة", "ديروط"],
    "سوهاج": ["سوهاج - شارع الكورنيش", "حي شرق", "سوهاج الجديدة", "أخميم"],
    "قنا": ["قنا - ميدان الساعة", "شارع كوبري دندرة", "قنا الجديدة", "نجع حمادي"],
    "كفر الشيخ": ["كفر الشيخ - وسط البلد", "دسوق - ميدان الإبراهيمي", "بلطيم - شاطئ النرجس"],
    "البحيرة": ["دمنهور - ميدان الساعة", "دمنهور - شارع عبد السلام عارف", "كفر الدوار", "إدكو", "رشيد"],
    "الشرقية": ["الزقازيق - القومية", "الزقازيق - شارع المحافظة", "مدينة العاشر من رمضان", "بلبيس", "فاقوس"],
    "المنوفية": ["شبين الكوم - شارع جمال عبد الناصر", "شبين الكوم - البر الشرقي", "مدينة السادات", "منوف", "أشمون"],
    "القليوبية": ["بنها - شارع الكورنيش", "بنها - الفلل", "شبرا الخيمة", "العبور", "قليوب"]
}

# Verified high quality photo categories
photo_collections = {
    "food": {
        "cover": [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1543353071-087092ec393a?w=800&auto=format&fit=crop, https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop"
    },
    "health": {
        "cover": [
            "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop, https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop"
    },
    "shopping": {
        "cover": [
            "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1581404917879-53e19259fdda?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop, https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop"
    },
    "hotels": {
        "cover": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop, https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop"
    },
    "entertainment": {
        "cover": [
            "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop, https://images.unsplash.com/photo-1572953109213-3be62398eb95?w=800&auto=format&fit=crop"
    },
    "education": {
        "cover": [
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop, https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop"
    },
    "sports": {
        "cover": [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop"
    },
    "finance": {
        "cover": [
            "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop"
    },
    "government": {
        "cover": [
            "https://images.unsplash.com/photo-1524813686514-a57563d77d47?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop"
    },
    "public_places": {
        "cover": [
            "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1548625361-195feeed9a02?w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&auto=format&fit=crop"
        ],
        "menu": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop"
    }
}

print("Photo library and governorates mapped.")
