import { useMemo, useState } from 'react'
import './App.css'

const categories = [
  { name: 'Everyday style', detail: 'Pieces for the everyday', image: 'photo-1483985988355-763728e1935b', filter: 'Clothing' },
  { name: 'The finishing touch', detail: 'Accessories with a point of view', image: 'photo-1526170375885-4d8ecf77b99f', filter: 'Accessories' },
  { name: 'A softer space', detail: 'Find your feel-good corner', image: 'photo-1494438639946-1ebd1d20bf85', filter: 'Home' },
]

const products = [
  { id: 1, name: 'Cloudstep Everyday Sneaker', category: 'Clothing', price: 84, rating: '4.9', reviews: 128, label: 'Bestseller', image: 'photo-1542291026-7eec264c27ff', tone: 'rose' },
  { id: 2, name: 'Studio Wireless Headphones', category: 'Accessories', price: 129, rating: '4.8', reviews: 96, label: 'Just in', image: 'photo-1505740420928-5e560c06d30e', tone: 'blue' },
  { id: 3, name: 'Everywhere Leather Tote', category: 'Accessories', price: 112, rating: '4.9', reviews: 74, label: '', image: 'photo-1548036328-c9fa89d128fa', tone: 'sand' },
  { id: 4, name: 'Sunday Morning Ceramic Set', category: 'Home', price: 58, rating: '4.7', reviews: 52, label: 'Small batch', image: 'photo-1490312278390-ab64016e0aa9', tone: 'mint' },
]

function photoUrl(photo, width = 900) {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`
}

function Header({ cartCount, search, onSearch, onCart, onLogin }) {
  return (
    <>
      <div className="announcement">A little something extra: free shipping over $75</div>
      <header className="site-header">
        <div className="header-main wrap">
          <a className="brand" href="#home" aria-label="Goodform home"><span className="brand-mark" aria-hidden="true">g.</span><span>goodform<span className="brand-period">.</span></span></a>
          <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
            <span className="search-icon" aria-hidden="true" />
            <input aria-label="Search products" placeholder="Search for something good..." value={search} onChange={(event) => onSearch(event.target.value)} />
            <kbd>⌘ K</kbd>
          </form>
          <div className="header-actions">
            <button className="text-action login-action" type="button" onClick={onLogin}>Sign in</button>
            <button className="cart-action" type="button" onClick={onCart} aria-label={`Open cart, ${cartCount} items`}><span className="bag-icon" aria-hidden="true" /><span className="cart-label">Cart</span><span className="cart-count">{cartCount}</span></button>
          </div>
        </div>
        <nav className="primary-nav wrap" aria-label="Main navigation">
          <a className="nav-current" href="#home">Home</a><a href="#shop">Shop all</a><a href="#categories">Categories</a>
          <a href="#shop" onClick={() => onSearch('Clothing')}>Clothing</a><a href="#shop" onClick={() => onSearch('Accessories')}>Accessories</a>
          <span className="nav-note">Considered things, for everyday living.</span>
        </nav>
      </header>
    </>
  )
}

function Hero() {
  return (
    <section className="hero wrap" id="home">
      <div className="hero-copy">
        <p className="eyebrow"><span /> The good things edit · No. 04</p>
        <h1>Good things<br />find their way <em>home.</em></h1>
        <p className="hero-description">Thoughtful finds for the way you live, work, and unwind. Meet the pieces you'll reach for every day.</p>
        <a className="button button-dark" href="#shop">Shop the collection <span aria-hidden="true">↗</span></a>
        <div className="hero-footnote"><span className="footnote-rule" /> New season, same good taste.</div>
      </div>
      <div className="hero-image">
        <img src={photoUrl('photo-1523381210434-271e8be1f52b', 1500)} alt="A considered edit of relaxed, everyday fashion" fetchPriority="high" />
        <div className="hero-image-tag"><span>THE NEW EDIT</span><strong>Made for your kind of day.</strong></div>
        <span className="hero-index">01 / 04</span>
      </div>
      <div className="hero-side-note" aria-hidden="true">OBJECTS WITH INTENTION · EST. 2024</div>
    </section>
  )
}

function SectionHeading({ kicker, title, link, href }) {
  return (
    <div className="section-heading">
      <div><p className="section-kicker">{kicker}</p><h2>{title}</h2></div>
      {link && <a className="underlined-link" href={href}>{link}<span aria-hidden="true"> ↗</span></a>}
    </div>
  )
}

function CategorySection({ onSelect }) {
  return (
    <section className="category-section wrap" id="categories">
      <SectionHeading kicker="A good place to start" title="Find your kind of good." link="Browse everything" href="#shop" />
      <div className="category-grid">
        {categories.map((category, index) => (
          <a className={`category-card category-card-${index + 1}`} href="#shop" key={category.name} onClick={() => onSelect(category.filter)}>
            <img src={photoUrl(category.image, 850)} alt="" loading="lazy" />
            <span className="category-number">0{index + 1}</span>
            <span className="category-copy"><span>{category.detail}</span><strong>{category.name}<span aria-hidden="true"> ↗</span></strong></span>
          </a>
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className={`product-image ${product.tone}`}>
        <img src={photoUrl(product.image, 760)} alt={product.name} loading="lazy" />
        {product.label && <span className="product-label">{product.label}</span>}
        <button className="quick-add" type="button" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to bag`}>+</button>
      </div>
      <div className="product-info">
        <div className="product-heading"><h3>{product.name}</h3><span className="product-price">${product.price}</span></div>
        <p className="product-meta">{product.category} <span className="rating"><span aria-hidden="true">★</span> {product.rating} <span className="review-count">({product.reviews})</span></span></p>
        <button className="add-button" type="button" onClick={() => onAdd(product)}>Add to bag <span aria-hidden="true">+</span></button>
      </div>
    </article>
  )
}

function ProductSection({ items, onAdd, search }) {
  return (
    <section className="products-section" id="shop">
      <div className="wrap">
        <SectionHeading kicker="The ones on our mind" title={search ? `A little something for “${search}”` : 'A few current favorites.'} link="Shop all products" href="#categories" />
        {items.length > 0 ? <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div> : <div className="empty-results"><p>No finds just yet.</p><span>Try another search or explore our categories.</span></div>}
        <p className="sample-note">A preview of the Goodform edit. Products shown are sample items and aren't saved to an account.</p>
      </div>
    </section>
  )
}

function Promotion() {
  return (
    <section className="promotion wrap">
      <div className="promotion-photo"><img src={photoUrl('photo-1441986300917-64674bd600d8', 1100)} alt="An inviting, thoughtfully curated shop interior" loading="lazy" /></div>
      <div className="promotion-copy">
        <p className="section-kicker">A better kind of browse</p><h2>Less, but a little<br /><em>more lovely.</em></h2>
        <p>We look for the useful, the lasting, and the quietly lovely. Then we bring it all to one very good place.</p>
        <a href="#shop" className="button button-outline">Meet your next favorite <span aria-hidden="true">↗</span></a>
        <span className="promotion-stamp" aria-hidden="true">GOOD<br />FORM</span>
      </div>
    </section>
  )
}

function Newsletter({ email, setEmail, subscribed, onSubscribe }) {
  return (
    <section className="newsletter" id="newsletter">
      <div className="wrap newsletter-inner">
        <div><p className="section-kicker">A nice note, now and then</p><h2>A little good in your inbox.</h2><p>New finds, thoughtful ideas, and little things worth opening.</p></div>
        <form className="newsletter-form" onSubmit={onSubscribe}>
          <label className="visually-hidden" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <button type="submit">{subscribed ? 'You’re on the list ✓' : 'Count me in ↗'}</button>
          <span className="newsletter-fineprint">{subscribed ? 'Thanks for your interest.' : 'Preview form only; email addresses aren’t saved.'}</span>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand-block"><a className="brand footer-brand" href="#home"><span className="brand-mark" aria-hidden="true">g.</span><span>goodform<span className="brand-period">.</span></span></a><p>Thoughtfully found.<br />Good to live with.</p></div>
        <div className="footer-column"><h3>Explore</h3><a href="#shop">Shop all</a><a href="#categories">Categories</a><a href="#shop">New arrivals</a></div>
        <div className="footer-column"><h3>Here to help</h3><a href="#newsletter">Contact us</a><a href="#newsletter">Shipping & returns</a><a href="#newsletter">FAQs</a></div>
        <div className="footer-column"><h3>Find us elsewhere</h3><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest ↗</a></div>
      </div>
      <div className="wrap footer-bottom"><span>© 2026 Goodform Studio. Made for everyday.</span><span>Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Terms</span><a href="#home">Back to top ↑</a></div>
    </footer>
  )
}

function CartDrawer({ cart, onClose, onRemove }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-heading"><div><p className="section-kicker">Your good finds</p><h2 id="cart-title">Your bag <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button type="button" className="close-button" onClick={onClose} aria-label="Close bag">×</button></div>
        {cart.length ? <><div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}>
          <img src={photoUrl(item.image, 200)} alt="" /><div><h3>{item.name}</h3><p>Qty {item.quantity} · ${item.price} each</p><button type="button" onClick={() => onRemove(item.id)}>Remove</button></div><strong>${item.price * item.quantity}</strong>
        </article>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>${total}</strong></div><p>Shipping and taxes calculated at checkout.</p><button type="button" className="button button-dark checkout-button" onClick={onClose}>Continue shopping <span aria-hidden="true">↗</span></button></div></> : <div className="cart-empty"><span className="empty-bag-icon" aria-hidden="true" /><h3>Your bag is taking a little breather.</h3><p>Find something good to bring home.</p><button type="button" className="button button-dark" onClick={onClose}>Keep browsing <span aria-hidden="true">↗</span></button></div>}
        <p className="cart-disclaimer">Sample cart only. Items aren't saved or sent to the database.</p>
      </section>
    </div>
  )
}

function LoginDialog({ onClose }) {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button type="button" className="close-button login-close" onClick={onClose} aria-label="Close sign in">×</button>
        <span className="brand-mark login-mark" aria-hidden="true">g.</span><p className="section-kicker">Good to have you</p><h2 id="login-title">Come on in.</h2>
        {submitted ? <p className="login-success">Thanks. Account sign-in will be available when accounts are connected.</p> : <form className="login-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
          <label htmlFor="login-email">Email address</label><input id="login-email" type="email" placeholder="you@example.com" required /><button type="submit" className="button button-dark">Continue with email <span aria-hidden="true">↗</span></button>
          <p>Account access is a preview and isn't connected to a backend yet.</p>
        </form>}
      </section>
    </div>
  )
}

function App() {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const filteredProducts = useMemo(() => products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase())), [search])

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { ...product, quantity: 1 }]
    })
  }

  function subscribe(event) {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <div className="page">
      <Header cartCount={cartCount} search={search} onSearch={setSearch} onCart={() => setCartOpen(true)} onLogin={() => setLoginOpen(true)} />
      <main><Hero /><CategorySection onSelect={setSearch} /><ProductSection items={filteredProducts} onAdd={addToCart} search={search} /><Promotion /><Newsletter email={email} setEmail={setEmail} subscribed={subscribed} onSubscribe={subscribe} /></main>
      <Footer />
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))} />}
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} />}
    </div>
  )
}

export default App
