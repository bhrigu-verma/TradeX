export default function PricingLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)', color: 'white', fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
