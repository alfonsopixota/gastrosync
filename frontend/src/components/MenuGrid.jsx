export default function MenuGrid({ menu, onAddToCart }) {
  return (
    <section className="menu-section" aria-label="Menú del restaurante">
      <h2>Menú</h2>
      <div className="menu-grid" role="group" aria-label="Platos disponibles">
        {menu.map((item) => (
          <button
            key={item._id}
            className="menu-card"
            onClick={() => onAddToCart(item)}
            aria-label={`${item.name}, ${item.price.toFixed(2)} euros, categoría ${item.category}`}
          >
            {item.image && (
              <div className="menu-card-image">
                <img src={item.image} alt={item.name} loading="lazy" />
              </div>
            )}
            <h3>{item.name}</h3>
            <span className="price">{item.price.toFixed(2)} €</span>
            <span className="category">{item.category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
