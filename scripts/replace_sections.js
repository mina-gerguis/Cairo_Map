const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// The regex we want to target starts with {/* Section 1: Nearby */} and ends before {/* Section 5: All Places */}
const section1To4Regex = /\{\/\* Section 1: Nearby \*\/\}[\s\S]*?(?=\{\/\* Section 5: All Places \*\/)/;

const newSections = `
            {/* Section 1: Nearby */}
            {isProximityEnabled && (
              <PaginatedSection 
                title={<>📍 أقرب الأماكن إليك {nearbyPlaces.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginRight: "12px" }}>بحث في نطاق 10 كم</span>}</>}
                places={nearbyPlaces} 
                setSelectedPlace={setSelectedPlace} 
                getCategoryColor={getCategoryColor} 
                toggleFavorite={toggleFavorite} 
                favoriteIds={favoriteIds} 
                emptyMessage="فعّل الموقع للعثور على أماكن قريبة منك 📍"
              />
            )}

            {/* Section 2: Top Rated */}
            <PaginatedSection 
              title="⭐ الأكثر زيارة" 
              places={topRatedPlaces} 
              setSelectedPlace={setSelectedPlace} 
              getCategoryColor={getCategoryColor} 
              toggleFavorite={toggleFavorite} 
              favoriteIds={favoriteIds} 
              showRating 
            />

            {/* Section 3: Family */}
            <PaginatedSection 
              title="👨‍👩‍👧‍👦 أماكن عائلية" 
              places={familyPlaces} 
              setSelectedPlace={setSelectedPlace} 
              getCategoryColor={getCategoryColor} 
              toggleFavorite={toggleFavorite} 
              favoriteIds={favoriteIds} 
            />

            {/* Section 4: Entertainment */}
            <PaginatedSection 
              title="🎭 أماكن ترفيهية" 
              places={entertainmentPlaces} 
              setSelectedPlace={setSelectedPlace} 
              getCategoryColor={getCategoryColor} 
              toggleFavorite={toggleFavorite} 
              favoriteIds={favoriteIds} 
            />

            `;

code = code.replace(section1To4Regex, newSections);
fs.writeFileSync('src/app/page.tsx', code);
console.log("Successfully replaced sections");
