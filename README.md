# 📚 BiblioTech — Plateforme de gestion de bibliothèque

Application web complète de gestion de bibliothèque multi-utilisateurs.
**Stack** : Node.js + Express + MySQL (backend) / Vite + React + Tailwind CSS (frontend)

---

## 📁 Structure du projet

```
bibliotheque/
├── database.sql              ← Script SQL complet (tables + données initiales)
├── backend/
│   ├── server.js             ← Point d'entrée Express
│   ├── .env.example          ← Variables d'environnement (à copier en .env)
│   ├── config/
│   │   ├── db.js             ← Connexion MySQL (pool)
│   │   └── cloudinary.js     ← Config Cloudinary + Multer
│   ├── middleware/
│   │   └── auth.js           ← JWT authenticate + authorize(roles)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── book.controller.js
│   │   ├── library.controller.js
│   │   ├── borrow.controller.js
│   │   ├── admin.controller.js
│   │   ├── category.controller.js
│   │   ├── notification.controller.js
│   │   ├── review.controller.js
│   │   └── user.controller.js
│   └── routes/
│       ├── auth.routes.js
│       ├── book.routes.js
│       ├── library.routes.js
│       ├── borrow.routes.js
│       ├── admin.routes.js
│       ├── category.routes.js
│       ├── notification.routes.js
│       ├── review.routes.js
│       └── user.routes.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx           ← Toutes les routes React
        ├── index.css         ← Classes Tailwind globales
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   └── api.js        ← Instance Axios + intercepteurs
        ├── components/shared/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   └── BookCard.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Books.jsx
            ├── BookDetail.jsx
            ├── Libraries.jsx
            ├── LibraryDetail.jsx
            ├── user/
            │   ├── Dashboard.jsx
            │   ├── MyBorrows.jsx
            │   └── Profile.jsx
            ├── library/
            │   ├── Dashboard.jsx
            │   ├── Books.jsx
            │   ├── Borrows.jsx
            │   └── Profile.jsx
            └── admin/
                ├── Dashboard.jsx
                ├── Libraries.jsx
                ├── Books.jsx
                └── Users.jsx
```

---

## 🚀 Installation

### 1. Base de données

```bash
mysql -u root -p < database.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# ✏️  Remplir le fichier .env avec vos valeurs
npm run dev
```

#### Variables .env requises

| Variable | Description |
|---|---|
| `DB_HOST` | Hôte MySQL (ex: localhost) |
| `DB_USER` | Utilisateur MySQL |
| `DB_PASSWORD` | Mot de passe MySQL |
| `DB_NAME` | Nom de la base (`bibliotheque_db`) |
| `JWT_SECRET` | Clé secrète JWT (chaîne longue et aléatoire) |
| `CLOUDINARY_CLOUD_NAME` | Nom de votre cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |
| `FRONTEND_URL` | URL du frontend (ex: http://localhost:5173) |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur **http://localhost:5173**
Le backend tourne sur **http://localhost:5000**

---

## 🔐 Compte admin par défaut

```
Email    : admin@bibliotheque.mg
Password : Admin@1234
```

> ⚠️ **Changez ce mot de passe en production !**
> Le hash dans la BDD correspond à `Admin@1234` (bcrypt, 10 rounds).

---

## 🌐 API Endpoints

### Auth
| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET  | `/api/auth/me` | Authentifié |

### Livres
| Méthode | Route | Accès |
|---|---|---|
| GET  | `/api/books` | Public (avec filtres) |
| GET  | `/api/books/:id` | Public |
| GET  | `/api/books/library/:id` | Public |
| POST | `/api/books` | Bibliothèque |
| PUT  | `/api/books/:id` | Bibliothèque / Admin |
| DELETE | `/api/books/:id` | Bibliothèque / Admin |

### Bibliothèques
| Méthode | Route | Accès |
|---|---|---|
| GET  | `/api/libraries` | Public |
| GET  | `/api/libraries/:id` | Public |
| GET  | `/api/libraries/mine` | Bibliothèque |
| POST | `/api/libraries` | Bibliothèque |
| PUT  | `/api/libraries/:id` | Bibliothèque / Admin |

### Emprunts
| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/borrows` | Utilisateur |
| GET  | `/api/borrows/my` | Utilisateur |
| GET  | `/api/borrows/library/:id` | Bibliothèque |
| GET  | `/api/borrows/all` | Admin |
| PUT  | `/api/borrows/:id/status` | Bibliothèque |

### Admin
| Méthode | Route | Accès |
|---|---|---|
| GET  | `/api/admin/stats` | Admin |
| GET  | `/api/admin/libraries/pending` | Admin |
| PUT  | `/api/admin/libraries/:id/status` | Admin |
| GET  | `/api/admin/books/pending` | Admin |
| PUT  | `/api/admin/books/:id/status` | Admin |
| GET  | `/api/admin/users` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |

---

## 🎭 Rôles et flux

```
Élève          → demande emprunt → Bibliothèque approuve/refuse → Certificat généré
Bibliothèque   → publie livre    → Admin valide/refuse → Livre visible
Bibliothèque   → s'inscrit       → Admin valide compte → Accès activé
Admin          → supervise tout  → valide bibliothèques, livres, gère utilisateurs
```

---

## 🛠️ Technologies utilisées

**Backend**
- Node.js + Express.js
- MySQL2 (pool de connexions)
- JWT (jsonwebtoken)
- bcryptjs (hash mots de passe)
- Cloudinary + Multer (upload images)
- uuid (génération codes certificats)

**Frontend**
- Vite + React 18
- React Router v6
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icônes)
- React Hot Toast (notifications)
- Axios (appels API)
