const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const imageWithSkeletonCode = `
/* ── Shared Image Component ── */
function ImageWithSkeleton({ src, alt, style, className, onClick, onError }: any) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative", ...style, overflow: "hidden" }} className={className} onClick={onClick}>
      {!loaded && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg-glass-card)", animation: "pulse 1.5s infinite" }} />
      )}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: style?.objectFit || "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setLoaded(true);
          if (onError) onError(e);
        }}
      />
    </div>
  );
}
`;

if (!code.includes("function ImageWithSkeleton")) {
  code = code.replace("/* ── Shared Paginated Section ── */", imageWithSkeletonCode + "\n/* ── Shared Paginated Section ── */");
  fs.writeFileSync('src/app/page.tsx', code);
  console.log("Successfully injected ImageWithSkeleton");
}
