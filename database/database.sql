-- ============================================================
-- BASE DE DONNÉES : Système de Gestion de Bibliothèque
-- Compatible MySQL / TiDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS bibliotheque_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bibliotheque_db;

-- ============================================================
-- TABLE : users
-- ============================================================
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'library', 'user') NOT NULL DEFAULT 'user',
  status      ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
  avatar      VARCHAR(500) DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : libraries
-- ============================================================
CREATE TABLE libraries (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  library_name VARCHAR(150) NOT NULL,
  address      VARCHAR(300) DEFAULT NULL,
  city         VARCHAR(100) DEFAULT NULL,
  description  TEXT DEFAULT NULL,
  image        VARCHAR(500) DEFAULT NULL,
  status       ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : categories
-- ============================================================
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : books
-- FIX 1: "ON SET NULL" → "ON DELETE SET NULL"
-- FIX 2: FULLTEXT INDEX retiré de la définition (ajouté via ALTER TABLE après)
-- ============================================================
CREATE TABLE books (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  library_id   INT NOT NULL,
  category_id  INT DEFAULT NULL,
  title        VARCHAR(200) NOT NULL,
  author       VARCHAR(150) NOT NULL,
  description  TEXT DEFAULT NULL,
  cover_image  VARCHAR(500) DEFAULT NULL,
  isbn         VARCHAR(30) DEFAULT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  status       ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (library_id)  REFERENCES libraries(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- FIX 2: FULLTEXT INDEX ajouté séparément pour éviter le conflit avec les FK
ALTER TABLE books ADD FULLTEXT INDEX ft_books (title, author);

-- ============================================================
-- TABLE : borrow_requests
-- ============================================================
CREATE TABLE borrow_requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  library_id   INT NOT NULL,
  status       ENUM('pending', 'approved', 'rejected', 'returned') NOT NULL DEFAULT 'pending',
  borrow_date  DATE DEFAULT NULL,
  return_date  DATE DEFAULT NULL,
  notes        TEXT DEFAULT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id)    REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : borrow_certificates
-- ============================================================
CREATE TABLE borrow_certificates (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  borrow_request_id INT NOT NULL UNIQUE,
  certificate_code  VARCHAR(50) NOT NULL UNIQUE,
  issued_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  pdf_url           VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (borrow_request_id) REFERENCES borrow_requests(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : notifications
-- ============================================================
CREATE TABLE notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  type       ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : reviews
-- ============================================================
CREATE TABLE reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  book_id    INT NOT NULL,
  rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Catégories de base
INSERT INTO categories (name, description) VALUES
  ('Roman',         'Œuvres de fiction narrative'),
  ('Science',       'Sciences exactes et naturelles'),
  ('Histoire',      'Histoire et civilisations'),
  ('Informatique',  'Technologie et programmation'),
  ('Philosophie',   'Pensée philosophique et éthique'),
  ('Jeunesse',      'Livres pour enfants et adolescents'),
  ('Droit',         'Droit et jurisprudence'),
  ('Économie',      'Économie et gestion'),
  ('Art',           'Beaux-arts, musique, cinéma'),
  ('Biographie',    'Biographies et mémoires');

-- Admin par défaut (mot de passe: Admin@1234 — à changer !)
-- Hash bcrypt généré pour 'Admin@1234'
INSERT INTO users (name, email, password, role, status) VALUES
  ('Administrateur', 'admin@bibliotheque.mg', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');