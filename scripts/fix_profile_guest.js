const fs = require('fs');
let code = fs.readFileSync('src/app/profile/page.tsx', 'utf8');

// 1. Remove redirect for non-logged-in users
code = code.replace(
  `  useEffect(() => {\n    if (authLoading) return;\n    if (!user) {\n      router.push(\"/login\");\n      return;\n    }`,
  `  useEffect(() => {\n    if (authLoading) return;\n    if (!user) {\n      // Don't redirect — show guest view instead\n      setLoading(false);\n      return;\n    }`
);

// 2. Replace the profile card header to show login prompt for guests
// Find the inner div of the profile card (the one with avatar, name, email)
const guestCard = `        {!user ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "10px 0" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border-glass-bright)" }}>
              <i className="bx bx-user" style={{ fontSize: "2rem", color: "var(--text-muted)" }}></i>
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>أهلاً بك!</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>سجل دخولك للوصول إلى ملفك الشخصي وكل مزايا التطبيق</p>
            </div>
            <Link href="/login" className="ios-btn ios-btn-primary" style={{ width: "100%", textDecoration: "none", justifyContent: "center" }}>
              <i className="bx bx-log-in" style={{ fontSize: "1.2rem" }}></i> تسجيل الدخول
            </Link>
            <Link href="/signup" style={{ color: "var(--accent-ios)", fontSize: "0.85rem", textDecoration: "none" }}>ليس لديك حساب؟ إنشاء حساب جديد</Link>
          </div>
        ) : (
          <>`;

const closingGuestCard = `          </>
        )}`;

const originalHeader = `        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-ios)" }} />
            ) : (
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--accent-ios)" }}>
                <i className="bx bxs-user" style={{ fontSize: "1.8rem", color: "var(--text-secondary)" }}></i>
              </div>
            )}
            <div style={{ textAlign: "right" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>{profile?.full_name}</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem" }}>{profile?.email}</p>
            </div>
          </div>
          <i className={\`bx \${isProfileExpanded ? "bx-chevron-up" : "bx-chevron-down"}\`} style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>

        {/* Expanded Profile Info / Form */}
        {isProfileExpanded && (`;

const replacedHeader = guestCard + `

        {/* Expanded Profile Info / Form */}
        {user && isProfileExpanded && (`;

code = code.replace(originalHeader, replacedHeader);

// Find the closing div of the profile card and add closing for guest section
// We need to close both the isProfileExpanded block and add the closing for the user ternary
// The profile card outer div ends at the </div> after the isProfileExpanded block
// Let's find the outer card closing tag
code = code.replace(
  `        {isProfileExpanded && (`,
  `        {user && isProfileExpanded && (`
);

// Find the end of the profile card section - right before APPEARANCE SECTION
const appearanceMarker = `      {/* ─── 2. APPEARANCE SECTION ─── */}`;
// Add closing tag before appearance section
// We need to close the user ternary opened above
// Look for the closing of profile card
const profileCardClose = `      </div>\n\n      ${appearanceMarker}`;
const newProfileCardClose = `      </div>\n        )}\n\n      ${appearanceMarker}`;

// Find existing closing
const idx = code.indexOf(appearanceMarker);
// Insert before it: close the user ternary
if (idx !== -1) {
  code = code.slice(0, idx) + closingGuestCard + '\n      </div>\n\n      ' + code.slice(idx + '      </div>\n\n      '.length);
}

// 3. Wrap SECURITY SECTION with {user && ...}
code = code.replace(
  `      {/* ─── SECURITY SECTION ─── */}\n      <div style={{ fontSize: "0.85rem",`,
  `      {/* ─── SECURITY SECTION ─── */}\n      {user && <><div style={{ fontSize: "0.85rem",`
);

// Find end of security section (before SUPPORT & HELP), close the user && <>
code = code.replace(
  `      {/* ─── 3. SUPPORT & HELP SECTION ─── */}`,
  `      </>\n      }\n      {/* ─── 3. SUPPORT & HELP SECTION ─── */}`
);

// 4. Wrap ADVANCED SECTION with {user && ...}
code = code.replace(
  `      {/* ─── 5. ADVANCED SECTION ─── */}\n      <div style={{ fontSize: "0.85rem",`,
  `      {/* ─── 5. ADVANCED SECTION ─── */}\n      {user && <><div style={{ fontSize: "0.85rem",`
);

// Find end of advanced section (before Delete Modal), close the user && <>
code = code.replace(
  `      {/* Delete Account Modal */}`,
  `      </>\n      }\n      {/* Delete Account Modal */}`
);

fs.writeFileSync('src/app/profile/page.tsx', code);
console.log("Profile page updated successfully!");
