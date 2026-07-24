const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const paginatedSectionCode = `
/* ── Shared Paginated Section ── */
function PaginatedSection({ title, places, setSelectedPlace, getCategoryColor, toggleFavorite, favoriteIds, showRating = false, emptyMessage }: {
  title: React.ReactNode;
  places: PlaceWithDist[];
  setSelectedPlace: (place: Place) => void;
  getCategoryColor: (cat: string) => string;
  toggleFavorite: (e: React.MouseEvent, placeId: string) => void;
  favoriteIds: Set<string>;
  showRating?: boolean;
  emptyMessage?: React.ReactNode;
}) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(places.length / itemsPerPage);
  
  useEffect(() => {
    setPage(1);
  }, [places.length]);

  if (places.length === 0 && !emptyMessage) return null;

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedPlaces = places.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section style={{ animation: "slide-in-section 0.5s ease both" }}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>
      
      {places.length === 0 && emptyMessage ? (
        <div className="glass-panel" style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", width: "100%" }}>
            {paginatedPlaces.map((place) => (
              <div key={place.id} className="glass-card" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative", width: "100%" }}>
                <PlaceCardContent place={place} getCategoryColor={getCategoryColor} showRating={showRating} toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "12px", width: "100%" }}>
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                <i className="bx bx-chevron-right"></i>
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={\`pagination-btn \${page === pageNum ? 'active' : ''}\`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                <i className="bx bx-chevron-left"></i>
              </button>
            </div>
          )}
        </div>
      )}
      <hr className="section-divider" />
    </section>
  );
}
`;

// 1. Insert PaginatedSection
if (!code.includes("function PaginatedSection")) {
  code = code.replace("/* ── Shared Place Card Content ── */", paginatedSectionCode + "\n/* ── Shared Place Card Content ── */");
}

// 2. Replace Sections 1 to 4 using regex matching everything from {/* Section 1: Nearby */} to {/* Section 5: All Places */}
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

// 3. Remove `topRatedPage` state from HomeContent since it's no longer used
code = code.replace(/const \[topRatedPage, setTopRatedPage\] = useState\(1\);\s*/g, '');

fs.writeFileSync('src/app/page.tsx', code);
console.log("Successfully updated page.tsx");
