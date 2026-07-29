export default function Spinner({ size = 'md' }) {
  const sizes = { sm: '1.5rem', md: '2.5rem', lg: '4rem' };
  return (
    <div className="spinner-container" role="status" aria-label="Cargando">
      <div className="spinner" style={{ width: sizes[size], height: sizes[size] }} />
    </div>
  );
}
