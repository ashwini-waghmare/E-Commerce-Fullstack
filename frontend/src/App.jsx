import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Heart, Minus, Plus, Search, ShoppingBag, Trash2, UserRound, X } from 'lucide-react'
import './App.css'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', withCredentials: true })
const cartStorageKey = 'goodform-cart'
const wishlistStorageKey = 'goodform-wishlist'

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function getErrorMessage(error) {
  return error?.response?.data?.message || 'Something went wrong. Please try again.'
}

function priceOf(product) {
  return Number(product.discount_price ?? product.price)
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

function StoreHeader({ search, setSearch, cartCount, wishlistCount, user }) {
  const navigate = useNavigate()
  function submitSearch(event) {
    event.preventDefault()
    navigate(`/shop${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`)
  }

  return <>
    <div className="announcement">A little something extra: free shipping over $75</div>
    <header className="site-header">
      <div className="header-main wrap">
        <Link className="brand" to="/" aria-label="Goodform home"><span className="brand-mark">g.</span><span>goodform<span className="brand-period">.</span></span></Link>
        <form className="search-form" role="search" onSubmit={submitSearch}>
          <Search size={16} aria-hidden="true" /><input aria-label="Search products" placeholder="Search for something good..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && <button className="search-clear" type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}
        </form>
        <div className="header-actions">
          <Link className="icon-action account-action" to={user ? '/account' : '/login'} aria-label={user ? `Account for ${user.name}` : 'Sign in'} title={user ? 'Your account' : 'Sign in'}><UserRound size={18} /><span>{user ? user.name.split(' ')[0] : 'Sign in'}</span></Link>
          <Link className="icon-action wishlist-action" to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} title="Wishlist"><Heart size={18} /><span className="cart-count">{wishlistCount}</span></Link>
          <Link className="cart-action" to="/cart" aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBag size={18} /><span className="cart-label">Bag</span><span className="cart-count">{cartCount}</span></Link>
        </div>
      </div>
      <nav className="primary-nav wrap" aria-label="Main navigation">
        <Link to="/">Home</Link><Link to="/shop">Shop</Link><Link to="/shop#categories">Categories</Link><a href="mailto:hello@goodform.example">Contact</a>
        <span className="nav-note">Considered things, for everyday living.</span>
      </nav>
    </header>
  </>
}

function SiteFooter() {
  return <footer className="site-footer">
    <div className="wrap footer-main">
      <div className="footer-brand-block"><Link className="brand footer-brand" to="/"><span className="brand-mark">g.</span><span>goodform<span className="brand-period">.</span></span></Link><p>Thoughtfully found.<br />Good to live with.</p></div>
      <div className="footer-column"><h3>Explore</h3><Link to="/shop">Shop all</Link><Link to="/shop#categories">Categories</Link><Link to="/wishlist">Your wishlist</Link></div>
      <div className="footer-column"><h3>Here to help</h3><a href="mailto:hello@goodform.example">Contact us</a><a href="mailto:hello@goodform.example?subject=Shipping%20and%20returns">Shipping & returns</a><Link to="/account">Order history</Link></div>
      <div className="footer-column"><h3>Find us elsewhere</h3><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest ↗</a></div>
    </div>
    <div className="wrap footer-bottom"><span>© 2026 Goodform Studio. Made for everyday.</span><span>Orders are confirmed without collecting payment.</span><Link to="/">Back to top ↑</Link></div>
  </footer>
}

function ProductCardLive({ product, onAdd, isWishlisted, onWishlist }) {
  const image = product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=760&q=85'
  const discount = product.discount_price && Number(product.discount_price) < Number(product.price)
  return <article className="product-card">
    <div className="product-image">
      <Link to={`/products/${product.slug || product.id}`} aria-label={`View ${product.name}`}><img src={image} alt={product.name} loading="lazy" /></Link>
      {discount && <span className="product-label">Sale</span>}
      <button className={`wishlist-toggle${isWishlisted ? ' is-active' : ''}`} type="button" onClick={() => onWishlist(product)} aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}><Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} /></button>
      <button className="quick-add" type="button" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to bag`}><Plus size={19} /></button>
    </div>
    <div className="product-info">
      <div className="product-heading"><h3><Link to={`/products/${product.slug || product.id}`}>{product.name}</Link></h3><span className="product-price">{money(priceOf(product))}</span></div>
      <p className="product-meta"><span>{product.category}</span><span className="rating"><span aria-hidden="true">★</span> {Number(product.rating || 0).toFixed(1)} <span className="review-count">({product.review_count || 0})</span></span></p>
      <button className="add-button" type="button" onClick={() => onAdd(product)} disabled={Number(product.stock) < 1}>{Number(product.stock) < 1 ? 'Sold out' : 'Add to bag'} <span aria-hidden="true">+</span></button>
    </div>
  </article>
}

function ProductGrid({ products, onAdd, wishlist, onWishlist }) {
  return <div className="product-grid">{products.map((product) => <ProductCardLive key={product.id} product={product} onAdd={onAdd} isWishlisted={wishlist.some((item) => item.id === product.id)} onWishlist={onWishlist} />)}</div>
}

function ProductStatus({ loading, error, empty, onRetry }) {
  if (loading) return <div className="store-state" role="status"><span className="loading-mark" />Finding good things...</div>
  if (error) return <div className="store-state store-error" role="alert"><p>{error}</p><button className="button button-outline" type="button" onClick={onRetry}>Try again</button></div>
  if (empty) return <div className="store-state"><strong>No finds just yet.</strong><p>Try another search or explore a different category.</p></div>
  return null
}

function HomePage({ onAdd, wishlist, onWishlist }) {
  const [result, setResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const products = result?.products || []
  const categoriesList = result?.categories || []
  const loading = result === null
  const error = result?.error || ''
  useEffect(() => {
    let active = true
    Promise.all([api.get('/api/products?limit=8&sort=popular'), api.get('/api/categories')])
      .then(([productResponse, categoryResponse]) => {
        if (active) setResult({ products: productResponse.data.products, categories: categoryResponse.data.categories, error: '' })
      })
      .catch((requestError) => { if (active) setResult({ products: [], categories: [], error: getErrorMessage(requestError) }) })
    return () => { active = false }
  }, [retryCount])
  function retry() {
    setResult(null)
    setRetryCount((count) => count + 1)
  }

  return <main>
    <Hero />
    <section className="category-section wrap" id="categories">
      <SectionHeading kicker="A good place to start" title="Find your kind of good." link="Browse everything" href="/shop" />
      {error && !categoriesList.length ? <ProductStatus loading={false} error={error} onRetry={retry} /> : <div className="category-grid">
        {categoriesList.map((category, index) => <Link className={`category-card category-card-${index + 1}`} to={`/shop?category=${encodeURIComponent(category.slug)}`} key={category.id}>
          <img src={category.image || 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=850&q=85'} alt="" loading="lazy" />
          <span className="category-number">0{index + 1}</span><span className="category-copy"><span>{category.product_count} considered finds</span><strong>{category.name}<span aria-hidden="true"> ↗</span></strong></span>
        </Link>)}
        {!categoriesList.length && !loading && !error && <ProductStatus loading={false} empty onRetry={retry} />}
      </div>}
    </section>
    <section className="products-section" id="shop"><div className="wrap">
      <SectionHeading kicker="The ones on our mind" title="A few current favorites." link="Shop all products" href="/shop" />
      <ProductStatus loading={loading} error={error && !products.length ? error : ''} empty={!loading && !error && products.length === 0} onRetry={retry} />
      {!loading && products.length > 0 && <ProductGrid products={products} onAdd={onAdd} wishlist={wishlist} onWishlist={onWishlist} />}
    </div></section>
    <Promotion />
    <section className="newsletter" id="contact"><div className="wrap newsletter-inner"><div><p className="section-kicker">A nice note, now and then</p><h2>A little good in your inbox.</h2><p>Questions or just saying hello? We’re here for you.</p></div><a className="button button-outline contact-button" href="mailto:hello@goodform.example">Get in touch <ArrowUpRight size={15} /></a></div></section>
  </main>
}

function ShopPage({ search, onAdd, wishlist, onWishlist }) {
  const [queryParams, setQueryParams] = useSearchParams()
  const [productResult, setProductResult] = useState(null)
  const [categoriesList, setCategoriesList] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('popular')
  const [retryCount, setRetryCount] = useState(0)
  const activeSearch = queryParams.get('search') || search
  const category = queryParams.get('category') || ''
  const requestKey = `${activeSearch}|${category}|${sort}|${minPrice}|${maxPrice}|${retryCount}`
  const isCurrentResult = productResult?.key === requestKey
  const products = isCurrentResult ? productResult.products : []
  const loading = !isCurrentResult
  const error = isCurrentResult ? productResult.error : ''

  useEffect(() => {
    let active = true
    api.get('/api/products', { params: { search: activeSearch || undefined, category: category || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, sort, limit: 48 } })
      .then(({ data }) => { if (active) setProductResult({ key: requestKey, products: data.products, error: '' }) })
      .catch((requestError) => { if (active) setProductResult({ key: requestKey, products: [], error: getErrorMessage(requestError) }) })
    return () => { active = false }
  }, [activeSearch, category, maxPrice, minPrice, requestKey, sort])

  useEffect(() => { api.get('/api/categories').then(({ data }) => setCategoriesList(data.categories)).catch(() => {}) }, [])
  function updateCategory(value) {
    const next = new URLSearchParams(queryParams)
    if (value) next.set('category', value)
    else next.delete('category')
    setQueryParams(next)
  }

  return <main className="wrap page-content shop-page">
    <div className="page-intro"><p className="section-kicker">The whole goodform edit</p><h1>{activeSearch ? `A little something for “${activeSearch}”` : 'Shop all.'}</h1><p>Thoughtful finds for everyday living.</p></div>
    <div className="shop-layout">
      <aside className="shop-filters" aria-label="Product filters">
        <label>Category<select value={category} onChange={(event) => updateCategory(event.target.value)}><option value="">All categories</option>{categoriesList.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
        <fieldset><legend>Price range</legend><div className="price-inputs"><label><span className="visually-hidden">Minimum price</span><input type="number" min="0" placeholder="Min $" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} /></label><span>to</span><label><span className="visually-hidden">Maximum price</span><input type="number" min="0" placeholder="Max $" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label></div></fieldset>
        {(category || activeSearch || minPrice || maxPrice) && <button className="clear-filters" type="button" onClick={() => { setQueryParams({}); setMinPrice(''); setMaxPrice('') }}>Clear filters</button>}
      </aside>
      <div className="shop-results"><div className="results-toolbar"><span>{loading ? 'Finding your finds...' : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`}</span><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Popularity</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="newest">Newest</option></select></label></div>
        <ProductStatus loading={loading} error={error} empty={!loading && !error && products.length === 0} onRetry={() => setRetryCount((count) => count + 1)} />
        {!loading && !error && products.length > 0 && <ProductGrid products={products} onAdd={onAdd} wishlist={wishlist} onWishlist={onWishlist} />}
      </div>
    </div>
  </main>
}

function ProductPage({ onAdd, wishlist, onWishlist }) {
  const { idOrSlug } = useParams()
  const [productResult, setProductResult] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${idOrSlug}|${retryCount}`
  const isCurrentResult = productResult?.key === requestKey
  const product = isCurrentResult ? productResult.product : null
  const loading = !isCurrentResult
  const error = isCurrentResult ? productResult.error : ''
  useEffect(() => {
    let active = true
    api.get(`/api/products/${encodeURIComponent(idOrSlug)}`)
      .then(({ data }) => { if (active) { setProductResult({ key: requestKey, product: data.product, error: '' }); setSelectedImage(0) } })
      .catch((requestError) => { if (active) setProductResult({ key: requestKey, product: null, error: getErrorMessage(requestError) }) })
    return () => { active = false }
  }, [idOrSlug, requestKey])
  if (loading) return <main className="wrap page-content"><ProductStatus loading /></main>
  if (error || !product) return <main className="wrap page-content"><ProductStatus error={error || 'Product not found.'} onRetry={() => setRetryCount((count) => count + 1)} /></main>
  const images = product.images?.length ? product.images : [product.image].filter(Boolean)
  const wishlisted = wishlist.some((item) => item.id === product.id)
  return <main className="wrap page-content product-detail-page">
    <Link className="back-link" to="/shop"><ArrowLeft size={15} /> Back to shop</Link>
    <div className="product-detail"><div className="detail-gallery">
      <div className="detail-main-image"><img src={images[selectedImage] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=85'} alt={product.name} /></div>
      {images.length > 1 && <div className="detail-thumbnails">{images.map((image, index) => <button className={selectedImage === index ? 'selected' : ''} type="button" key={image} onClick={() => setSelectedImage(index)} aria-label={`View product image ${index + 1}`}><img src={image} alt="" /></button>)}</div>}
    </div><div className="detail-copy"><p className="section-kicker">{product.category}</p><h1>{product.name}</h1><div className="detail-price">{money(priceOf(product))}{product.discount_price && <del>{money(product.price)}</del>}</div><p className="detail-rating"><span>★</span> {Number(product.rating).toFixed(1)} <span>({product.review_count} reviews)</span></p><p className="detail-description">{product.description || 'A thoughtful everyday find, chosen for its lasting quality and considered details.'}</p><p className={`stock-status${product.stock < 1 ? ' out-of-stock' : ''}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}</p>
      <div className="detail-actions"><div className="quantity-control"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(Number(product.stock), quantity + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity"><Plus size={15} /></button></div><button className="button button-dark" type="button" disabled={product.stock < 1} onClick={() => onAdd(product, quantity)}>Add to bag <ShoppingBag size={16} /></button><button className={`detail-wishlist${wishlisted ? ' is-active' : ''}`} type="button" onClick={() => onWishlist(product)} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} /></button></div>
      <div className="detail-notes"><p><Check size={15} /> Thoughtfully selected for everyday use</p><p><Check size={15} /> Secure checkout with payment status shown clearly</p></div>
    </div></div>
  </main>
}

function CartPage({ cart, updateQuantity, removeItem }) {
  const subtotal = cart.reduce((sum, item) => sum + priceOf(item) * item.quantity, 0)
  return <main className="wrap page-content cart-page"><div className="page-intro"><p className="section-kicker">Your good finds</p><h1>Your bag.</h1></div>
    {!cart.length ? <div className="empty-cart"><ShoppingBag size={30} /><h2>Your bag is taking a little breather.</h2><p>Find something good to bring home.</p><Link className="button button-dark" to="/shop">Keep browsing <ArrowRight size={15} /></Link></div> : <div className="cart-layout"><section className="cart-lines" aria-label="Items in your bag">{cart.map((item) => <article className="cart-line" key={item.id}><Link to={`/products/${item.slug || item.id}`} className="cart-line-image"><img src={item.image || item.images?.[0]} alt="" /></Link><div className="cart-line-info"><Link to={`/products/${item.slug || item.id}`}><h2>{item.name}</h2></Link><p>{item.category}</p><strong>{money(priceOf(item))}</strong><div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)} disabled={item.quantity >= item.stock} aria-label={`Increase ${item.name} quantity`}><Plus size={14} /></button></div></div><div className="cart-line-end"><strong>{money(priceOf(item) * item.quantity)}</strong><button className="remove-item" type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button></div></article>)}</section>
      <aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Shipping</span><span>Calculated at checkout</span></div><p>Payment is not collected by this store.</p><Link className="button button-dark" to="/checkout">Continue to checkout <ArrowRight size={15} /></Link><Link className="summary-back" to="/shop">Continue shopping</Link></aside></div>}
  </main>
}

function CheckoutPage({ cart, clearCart }) {
  const [form, setForm] = useState({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const subtotal = cart.reduce((sum, item) => sum + priceOf(item) * item.quantity, 0)
  if (!cart.length) return <Navigate to="/cart" replace />
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }
  async function placeOrder(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/orders', { shippingAddress: form, items: cart.map((item) => ({ productId: Number(item.id), quantity: item.quantity })) })
      clearCart()
      navigate(`/order-confirmation/${data.order.id}`, { state: { order: data.order, message: data.message } })
    } catch (requestError) { setError(getErrorMessage(requestError)) }
    finally { setSubmitting(false) }
  }
  return <main className="wrap page-content checkout-page"><div className="page-intro"><p className="section-kicker">Almost home</p><h1>Checkout.</h1><p>Your order will be recorded, but no payment will be collected.</p></div><div className="checkout-layout">
    <form className="checkout-form" onSubmit={placeOrder}><h2>Shipping address</h2><div className="form-grid">
      {[['fullName', 'Full name'], ['phone', 'Phone'], ['addressLine', 'Address'], ['city', 'City'], ['state', 'State / province'], ['postalCode', 'Postal code'], ['country', 'Country']].map(([name, label]) => <label className={name === 'addressLine' ? 'wide-field' : ''} key={name}>{label}<input name={name} value={form[name]} onChange={update} required maxLength={255} autoComplete={name === 'fullName' ? 'name' : name === 'addressLine' ? 'street-address' : name === 'postalCode' ? 'postal-code' : name} /></label>)}
      </div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={submitting}>{submitting ? 'Placing order...' : 'Place order'} <ArrowRight size={15} /></button></form>
    <aside className="order-summary"><h2>Order summary</h2>{cart.map((item) => <div className="summary-item" key={item.id}><span>{item.name} × {item.quantity}</span><strong>{money(priceOf(item) * item.quantity)}</strong></div>)}<div className="summary-total"><span>Total</span><strong>{money(subtotal)}</strong></div><p className="payment-note">No payment gateway is configured. Your order status will be pending and no charge will be made.</p></aside>
  </div></main>
}

function AuthPage({ onAuthenticated }) {
  const [registerMode, setRegisterMode] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/account'
  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post(`/api/auth/${registerMode ? 'register' : 'login'}`, form)
      onAuthenticated(data.user)
      navigate(next.startsWith('/') ? next : '/account', { replace: true })
    } catch (requestError) { setError(getErrorMessage(requestError)) }
    finally { setSubmitting(false) }
  }
  return <main className="auth-page"><section className="auth-panel"><Link className="back-link" to="/"><ArrowLeft size={15} /> Back to the good things</Link><span className="brand-mark auth-mark">g.</span><p className="section-kicker">{registerMode ? 'A good place to begin' : 'Good to have you'}</p><h1>{registerMode ? 'Make yourself at home.' : 'Come on in.'}</h1><p className="auth-intro">{registerMode ? 'Create an account to keep your orders close.' : 'Sign in to see your orders and saved finds.'}</p>
    <form className="auth-form" onSubmit={submit}>{registerMode && <label>Your name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} maxLength={100} /></label>}<label>Email address<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label>Password<input type="password" autoComplete={registerMode ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={registerMode ? 8 : 1} maxLength={72} />{registerMode && <span className="field-hint">Use at least 8 characters.</span>}</label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={submitting}>{submitting ? 'One moment...' : registerMode ? 'Create account' : 'Sign in'} <ArrowRight size={15} /></button></form>
    <p className="auth-switch">{registerMode ? 'Already have an account?' : 'New to goodform?'} <button type="button" onClick={() => { setRegisterMode(!registerMode); setError('') }}>{registerMode ? 'Sign in' : 'Create an account'}</button></p>
  </section></main>
}

function AccountPage({ user, onSignOut }) {
  const [orderResult, setOrderResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const isCurrentResult = orderResult?.retryCount === retryCount
  const orders = isCurrentResult ? orderResult.orders : []
  const loading = !isCurrentResult
  const error = isCurrentResult ? orderResult.error : ''
  useEffect(() => {
    let active = true
    api.get('/api/orders')
      .then(({ data }) => { if (active) setOrderResult({ retryCount, orders: data.orders, error: '' }) })
      .catch((requestError) => { if (active) setOrderResult({ retryCount, orders: [], error: getErrorMessage(requestError) }) })
    return () => { active = false }
  }, [retryCount])
  return <main className="wrap page-content account-page"><div className="account-heading"><div><p className="section-kicker">Good to see you</p><h1>{user.name}.</h1><p>{user.email}</p></div><button className="text-button" type="button" onClick={onSignOut}>Sign out</button></div><section className="account-orders"><div className="account-section-heading"><h2>Your orders</h2><Link to="/shop">Find something good <ArrowUpRight size={14} /></Link></div>
    {loading ? <ProductStatus loading /> : error ? <ProductStatus error={error} onRetry={() => setRetryCount((count) => count + 1)} /> : orders.length ? <div className="order-list">{orders.map((order) => <article className="order-row" key={order.id}><div><span className="order-number">{order.order_number}</span><span>{new Date(order.created_at).toLocaleDateString()}</span></div><span className={`status-pill status-${order.status}`}>{order.status}</span><span>{money(order.total)}</span><span className="payment-status">Payment: {order.payment_status}</span></article>)}</div> : <div className="empty-orders"><p>No orders just yet.</p><Link to="/shop">Explore the shop <ArrowRight size={14} /></Link></div>}
  </section></main>
}

function WishlistPage({ wishlist, onAdd, onWishlist }) {
  return <main className="wrap page-content wishlist-page"><div className="page-intro"><p className="section-kicker">Saved for another day</p><h1>Your wishlist.</h1></div>{wishlist.length ? <ProductGrid products={wishlist} onAdd={onAdd} wishlist={wishlist} onWishlist={onWishlist} /> : <div className="empty-cart"><Heart size={28} /><h2>Keep the good ones close.</h2><p>Tap the heart on a find to save it here.</p><Link className="button button-dark" to="/shop">Explore the shop <ArrowRight size={15} /></Link></div>}</main>
}

function OrderConfirmationPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order || null)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  useEffect(() => {
    if (order) return
    api.get(`/api/orders/${orderId}`).then(({ data }) => setOrder(data.order)).catch((requestError) => setError(getErrorMessage(requestError)))
  }, [orderId, order, retryCount])
  if (error) return <main className="wrap page-content"><ProductStatus error={error} onRetry={() => { setError(''); setRetryCount((count) => count + 1) }} /></main>
  if (!order) return <main className="wrap page-content"><ProductStatus loading /></main>
  return <main className="wrap page-content confirmation-page"><div className="confirmation-icon"><Check size={28} /></div><p className="section-kicker">Thank you for your order</p><h1>It’s in good hands.</h1><p className="confirmation-number">Order {order.orderNumber || order.order_number}</p><div className="payment-notice"><strong>Payment not collected</strong><p>This order is recorded as pending. No payment was processed because a payment gateway is not configured.</p></div><div className="confirmation-total"><span>Order total</span><strong>{money(order.total)}</strong></div><div className="confirmation-actions"><Link className="button button-dark" to="/account">View your orders <ArrowRight size={15} /></Link><Link className="text-button" to="/shop">Continue shopping</Link></div></main>
}

function photoUrl(photo, width = 900) {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`
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

function App() {
  return <BrowserRouter><Storefront /></BrowserRouter>
}

function Storefront() {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState(() => readStorage(cartStorageKey))
  const [wishlist, setWishlist] = useState(() => readStorage(wishlistStorageKey))
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => { localStorage.setItem(cartStorageKey, JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist)) }, [wishlist])
  useEffect(() => {
    api.get('/api/auth/me').then(({ data }) => setUser(data.user)).catch(() => setUser(null)).finally(() => setAuthLoading(false))
  }, [])

  function addToCart(product, quantity = 1) {
    if (Number(product.stock) < 1) return
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      const nextQuantity = Math.min(Number(product.stock), (existing?.quantity || 0) + quantity)
      if (existing) return current.map((item) => item.id === product.id ? { ...item, ...product, quantity: nextQuantity } : item)
      return [...current, { ...product, quantity: Math.min(Number(product.stock), quantity) }]
    })
    setNotice(`${product.name} added to your bag.`)
  }

  function updateQuantity(productId, quantity, stock = Infinity) {
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.id !== productId))
      return
    }
    setCart((current) => current.map((item) => item.id === productId ? { ...item, quantity: Math.min(quantity, Number(stock)) } : item))
  }

  function toggleWishlist(product) {
    setWishlist((current) => current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, product])
  }

  async function signOut() {
    await api.post('/api/auth/logout').catch(() => {})
    setUser(null)
    navigate('/')
  }

  const protectedPage = (page) => authLoading
    ? <main className="wrap page-content"><ProductStatus loading /></main>
    : user ? page : <Navigate to={`/login?next=${encodeURIComponent(window.location.pathname)}`} replace />

  return <div className="page">
    <StoreHeader search={search} setSearch={setSearch} cartCount={cartCount} wishlistCount={wishlist.length} user={user} />
    {notice && <div className="store-notice" role="status"><Check size={15} /> {notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
    <Routes>
      <Route path="/" element={<HomePage onAdd={addToCart} wishlist={wishlist} onWishlist={toggleWishlist} />} />
      <Route path="/shop" element={<ShopPage search={search} onAdd={addToCart} wishlist={wishlist} onWishlist={toggleWishlist} />} />
      <Route path="/products/:idOrSlug" element={<ProductPage onAdd={addToCart} wishlist={wishlist} onWishlist={toggleWishlist} />} />
      <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeItem={(id) => setCart((current) => current.filter((item) => item.id !== id))} />} />
      <Route path="/checkout" element={protectedPage(<CheckoutPage cart={cart} clearCart={() => setCart([])} />)} />
      <Route path="/order-confirmation/:orderId" element={protectedPage(<OrderConfirmationPage />)} />
      <Route path="/login" element={<AuthPage onAuthenticated={setUser} />} />
      <Route path="/account" element={protectedPage(<AccountPage user={user} onSignOut={signOut} />)} />
      <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} onAdd={addToCart} onWishlist={toggleWishlist} />} />
      <Route path="*" element={<main className="wrap page-content not-found"><p className="section-kicker">A little detour</p><h1>We couldn’t find that page.</h1><Link className="button button-dark" to="/shop">Back to the shop <ArrowRight size={15} /></Link></main>} />
    </Routes>
    <SiteFooter />
  </div>
}

export default App
