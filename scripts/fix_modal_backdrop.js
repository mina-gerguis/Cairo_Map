const fs = require('fs');

const OPAQUE_BG = 'rgba(0, 0, 0, 0.85)';

// ─── 1. Fix profile/page.tsx modals ───
let profile = fs.readFileSync('src/app/profile/page.tsx', 'utf8');

// Replace all modal overlay blur backgrounds
profile = profile.replaceAll(
  `background: "rgba(10, 15, 30, 0.72)", \n          backdropFilter: "blur(16px)", \n          WebkitBackdropFilter: "blur(16px)", `,
  `background: "${OPAQUE_BG}", `
);
// The notification overlay inside profile
profile = profile.replace(
  `background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", zIndex: 10000`,
  `background: "${OPAQUE_BG}", zIndex: 10000`
);

// ─── 2. Restyle Delete Account modal as HeroUI AlertDialog style ───
const oldDeleteModal = `      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: "${OPAQUE_BG}", 
          zIndex: 1000, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "20px" 
        }}>
          <div className="glass-panel" style={{ maxWidth: "440px", width: "100%", padding: "30px", animation: "fade-in 0.3s ease", border: "1px solid rgba(255, 59, 48, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", borderRadius: "28px" }}>
            <h3 style={{ fontSize: "1.3rem", color: "#ff3b30", marginBottom: "16px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><i className="bx bx-error" style={{ fontSize: "1.5rem" }}></i> تحذير: حذف الحساب</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "12px", lineHeight: "1.6" }}>
              أنت على وشك حذف حسابك نهائياً. سيؤدي ذلك إلى فقدان كافة بياناتك، صورك، وأماكنك المفضلة ولا يمكن التراجع عن هذه الخطوة.
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              يرجى كتابة العبارة التالية بدقة للتأكيد:<br/>
              <strong style={{ userSelect: "none", color: "var(--text-primary)", display: "block", marginTop: "8px", padding: "8px", background: "var(--border-glass-bright)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>{deleteString}</strong>
            </p>
            
            <input 
              type="text" 
              className="ios-input" 
              placeholder="اكتب العبارة هنا..." 
              value={deleteConfirmation} 
              onChange={e => setDeleteConfirmation(e.target.value)} 
              style={{ marginBottom: "20px", textAlign: "center" }}
            />
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="ios-btn" onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }} style={{ flex: 1 }}>إلغاء</button>
              <button className="ios-btn" onClick={handleDeleteAccount} disabled={deleteConfirmation !== deleteString || loading} style={{ flex: 1, background: "#ff3b30", color: "#fff", opacity: deleteConfirmation !== deleteString ? 0.5 : 1 }}>
                {loading ? "جاري الحذف..." : "حذف نهائي"}
              </button>
            </div>
          </div>
        </div>
      )}`;

const newDeleteModal = `      {/* Delete Account Modal - HeroUI AlertDialog Style */}
      {showDeleteModal && (
        <div 
          className="modal-backdrop"
          onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "${OPAQUE_BG}", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade-in 0.2s ease" }}
        >
          <div 
            className="glass-panel alert-dialog"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "440px", width: "100%", padding: "0", animation: "slide-up 0.25s ease", border: "1px solid rgba(255, 59, 48, 0.25)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", borderRadius: "20px", overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{ background: "rgba(255, 59, 48, 0.08)", borderBottom: "1px solid rgba(255, 59, 48, 0.15)", padding: "24px 28px 20px", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255, 59, 48, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <i className="bx bx-error" style={{ fontSize: "1.8rem", color: "#ff3b30" }}></i>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ff3b30", margin: 0 }}>تحذير: حذف الحساب</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: "1.5" }}>
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 28px 24px" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.6", textAlign: "center" }}>
                يرجى كتابة العبارة التالية للتأكيد:
              </p>
              <div style={{ userSelect: "none", color: "var(--text-primary)", padding: "10px 14px", background: "rgba(255,59,48,0.06)", border: "1px dashed rgba(255,59,48,0.3)", borderRadius: "10px", textAlign: "center", fontSize: "0.88rem", fontWeight: "700", marginBottom: "16px" }}>
                {deleteString}
              </div>
              <input 
                type="text" 
                className="ios-input" 
                placeholder="اكتب العبارة هنا..." 
                value={deleteConfirmation} 
                onChange={e => setDeleteConfirmation(e.target.value)} 
                style={{ marginBottom: "20px", textAlign: "center" }}
              />
              
              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  className="ios-btn" 
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }} 
                  style={{ flex: 1 }}
                >
                  <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
                </button>
                <button 
                  className="ios-btn" 
                  onClick={handleDeleteAccount} 
                  disabled={deleteConfirmation !== deleteString || loading} 
                  style={{ flex: 1, background: "#ff3b30", color: "#fff", opacity: deleteConfirmation !== deleteString ? 0.45 : 1, transition: "opacity 0.2s" }}
                >
                  <i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i>
                  {loading ? "جاري الحذف..." : "حذف نهائي"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`;

// Only replace if we can find the old one
if (profile.includes('      {/* Delete Account Modal */}')) {
  profile = profile.replace(
    /      \{\/\* Delete Account Modal \*\/\}[\s\S]*?      \)\}/,
    newDeleteModal
  );
  console.log("Delete modal replaced!");
} else {
  console.log("WARNING: Delete modal not found by exact match, skipping...");
}

fs.writeFileSync('src/app/profile/page.tsx', profile);
console.log("profile/page.tsx updated");

// ─── 3. Fix NotificationContext.tsx ───
let ctx = fs.readFileSync('src/context/NotificationContext.tsx', 'utf8');
ctx = ctx.replace(
  /backdropFilter: "blur\(20px\)"/g,
  `background: "${OPAQUE_BG}"`
);
ctx = ctx.replace(
  /WebkitBackdropFilter: "blur\(20px\)"/g,
  ``
);
fs.writeFileSync('src/context/NotificationContext.tsx', ctx);
console.log("NotificationContext.tsx updated");

// ─── 4. Add slide-up animation to globals.css ───
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('@keyframes slide-up')) {
  css += `
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
`;
  fs.writeFileSync('src/app/globals.css', css);
  console.log("globals.css updated");
}

console.log("All done!");
