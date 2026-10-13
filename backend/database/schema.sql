-- E-commerce MySQL schema
-- Database name must match DB_NAME in backend/.env
-- No seed data. Passwords must be stored as hashes only, never plaintext.

CREATE DATABASE IF NOT EXISTS ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Store a password hash only, never plaintext',
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS addresses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_addresses_user_id (user_id),
  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  description TEXT NULL,
  image VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2) NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  brand VARCHAR(120) NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_category_id (category_id),
  KEY idx_products_is_active (is_active),
  KEY idx_products_brand (brand),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_discount_price CHECK (discount_price IS NULL OR discount_price >= 0),
  CONSTRAINT chk_products_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_images_product_sort (product_id, sort_order),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_variants (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  variant_type VARCHAR(50) NOT NULL,
  variant_value VARCHAR(100) NOT NULL,
  additional_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_variants_type_value (product_id, variant_type, variant_value),
  CONSTRAINT chk_product_variants_additional_price CHECK (additional_price >= 0),
  CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_carts_user_id (user_id),
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_items_cart_product (cart_id, product_id),
  KEY idx_cart_items_product_id (product_id),
  CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlists (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlists_user_id (user_id),
  CONSTRAINT fk_wishlists_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  wishlist_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_items_wishlist_product (wishlist_id, product_id),
  KEY idx_wishlist_items_product_id (product_id),
  CONSTRAINT fk_wishlist_items_wishlist
    FOREIGN KEY (wishlist_id) REFERENCES wishlists (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_items_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  order_number VARCHAR(32) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status ENUM(
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ) NOT NULL DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_user_id (user_id),
  KEY idx_orders_status (status),
  KEY idx_orders_payment_status (payment_status),
  CONSTRAINT chk_orders_money CHECK (
    subtotal >= 0 AND discount >= 0 AND tax >= 0 AND shipping_fee >= 0 AND total >= 0
  ),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  product_name VARCHAR(200) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_price CHECK (price >= 0 AND total >= 0),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_transaction_id (transaction_id),
  KEY idx_payments_order_id (order_id),
  KEY idx_payments_status (status),
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  maximum_discount DECIMAL(12, 2) NULL,
  usage_limit INT UNSIGNED NULL,
  used_count INT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code),
  KEY idx_coupons_is_active (is_active),
  KEY idx_coupons_expires_at (expires_at),
  CONSTRAINT chk_coupons_discount_value CHECK (discount_value >= 0),
  CONSTRAINT chk_coupons_minimum_order_amount CHECK (minimum_order_amount >= 0),
  CONSTRAINT chk_coupons_maximum_discount CHECK (maximum_discount IS NULL OR maximum_discount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_user_product_order (user_id, product_id, order_id),
  KEY idx_reviews_product_id (product_id),
  KEY idx_reviews_order_id (order_id),
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Idempotent starter catalog. Existing categories, products, and images are preserved.
INSERT IGNORE INTO categories (name, slug, description, image) VALUES
  ('Clothing', 'clothing', 'Easy layers and everyday pieces.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85'),
  ('Accessories', 'accessories', 'The useful finishing touches.', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=85'),
  ('Home', 'home', 'A softer space, one good detail at a time.', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85');

INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Cloudstep Everyday Sneaker', 'cloudstep-everyday-sneaker', 'A light, cushioned sneaker made for long days and easy plans.', 84.00, 74.00, 24, 'Goodform Studio', 4.90, 128 FROM categories WHERE slug = 'clothing';
INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Sunday Cotton Shirt', 'sunday-cotton-shirt', 'Relaxed cotton poplin with a little room to move.', 68.00, NULL, 18, 'Goodform Studio', 4.80, 64 FROM categories WHERE slug = 'clothing';
INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Softline Weekend Knit', 'softline-weekend-knit', 'A soft, breathable knit for cool mornings and slower evenings.', 96.00, 86.00, 12, 'Goodform Studio', 4.70, 43 FROM categories WHERE slug = 'clothing';
INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Studio Wireless Headphones', 'studio-wireless-headphones', 'Clear, balanced sound with comfortable all-day cushioning.', 129.00, NULL, 15, 'Goodform Audio', 4.80, 96 FROM categories WHERE slug = 'accessories';
INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Everywhere Leather Tote', 'everywhere-leather-tote', 'A considered carryall with a roomy interior and simple lines.', 112.00, NULL, 11, 'Goodform Studio', 4.90, 74 FROM categories WHERE slug = 'accessories';
INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Daylight Ceramic Mug', 'daylight-ceramic-mug', 'A hand-finished stoneware mug with an easy, balanced handle.', 32.00, 28.00, 30, 'Goodform Home', 4.80, 81 FROM categories WHERE slug = 'home';
INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Sunday Morning Ceramic Set', 'sunday-morning-ceramic-set', 'A small-batch set for slow breakfasts and good company.', 58.00, NULL, 9, 'Goodform Home', 4.70, 52 FROM categories WHERE slug = 'home';
INSERT IGNORE INTO products (category_id, name, slug, description, price, discount_price, stock, brand, rating, review_count)
SELECT id, 'Quiet Hour Linen Throw', 'quiet-hour-linen-throw', 'A softly textured layer woven for the sofa, the bed, and everything in between.', 89.00, 79.00, 14, 'Goodform Home', 4.90, 37 FROM categories WHERE slug = 'home';

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT p.id, seed.image_url, 0 FROM (
  SELECT 'cloudstep-everyday-sneaker' AS slug, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85' AS image_url UNION ALL
  SELECT 'sunday-cotton-shirt', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=85' UNION ALL
  SELECT 'softline-weekend-knit', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85' UNION ALL
  SELECT 'studio-wireless-headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85' UNION ALL
  SELECT 'everywhere-leather-tote', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85' UNION ALL
  SELECT 'daylight-ceramic-mug', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85' UNION ALL
  SELECT 'sunday-morning-ceramic-set', 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1000&q=85' UNION ALL
  SELECT 'quiet-hour-linen-throw', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85'
) AS seed
JOIN products p ON p.slug = seed.slug
WHERE NOT EXISTS (
  SELECT 1 FROM product_images existing WHERE existing.product_id = p.id AND existing.image_url = seed.image_url
);
