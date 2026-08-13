import re
import os

file_path = 'src/app/admin/places/page.tsx'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Pattern to match string literals: double quotes, single quotes, template literals
string_pattern = re.compile(r'("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`)')

def fix_mojibake(match):
    original_str = match.group(0)
    if len(original_str) <= 2:
        return original_str
        
    quote_char = original_str[0]
    content = original_str[1:-1]
    
    # Try decoding CP1252 to UTF-8
    try:
        fixed = content.encode('cp1252').decode('utf-8')
        if any('\u0600' <= c <= '\u06FF' for c in fixed):
            # Escape inner quotes of the same type if necessary
            escaped = fixed.replace(quote_char, '\\' + quote_char)
            return quote_char + escaped + quote_char
    except Exception:
        pass
        
    # Try decoding Latin-1 to UTF-8
    try:
        fixed = content.encode('latin-1').decode('utf-8')
        if any('\u0600' <= c <= '\u06FF' for c in fixed):
            escaped = fixed.replace(quote_char, '\\' + quote_char)
            return quote_char + escaped + quote_char
    except Exception:
        pass
        
    return original_str

fixed_code = string_pattern.sub(fix_mojibake, code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(fixed_code)

print("Mojibake fix completed successfully!")
