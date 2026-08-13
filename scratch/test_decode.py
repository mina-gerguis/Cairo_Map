# -*- coding: utf-8 -*-
text = "Ø§Ù„Ø§Ø´ØªØ±Ø§ÙƒØ§Øª Ø§Ù„Ù…Ù…ÙŠØ²Ø©"
print("Original:", text)

# Try CP1252 -> UTF-8
try:
    decoded = text.encode('cp1252').decode('utf-8')
    print("CP1252 Decoded:", decoded)
except Exception as e:
    print("CP1252 Error:", e)

# Try Latin-1 -> UTF-8
try:
    decoded = text.encode('latin-1').decode('utf-8')
    print("Latin-1 Decoded:", decoded)
except Exception as e:
    print("Latin-1 Error:", e)
