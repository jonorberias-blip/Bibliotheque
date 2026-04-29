import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages publiques
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Books         from './pages/Books';
import BookDetail    from './pages/BookDetail';
import Libraries     from './pages/Libraries';
import LibraryDetail from './pages/LibraryDetail';

// Pages utilisateur
import UserDashboard from './pages/user/Dashboard';
import MyBorrows     from './pages/user/MyBorrows';
import UserProfile   from './pages/user/Profile';

// Pages bibliothèque
import LibDashboard  from './pages/library/Dashboard';
import LibBooks      from './pages/library/Books';
import LibBorrows    from './pages/library/Borrows';
import LibProfile    from './pages/library/Profile';

// Pages admin
import AdminDashboard   from './pages/admin/Dashboard';
import AdminLibraries   from './pages/admin/Libraries';
import AdminBooks       from './pages/admin/Books';
import AdminUsers       from './pages/admin/Users';

// Guards
const RequireAuth = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"/></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<Home />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />
      <Route path="/books"      element={<Books />} />
      <Route path="/books/:id"  element={<BookDetail />} />
      <Route path="/libraries"       element={<Libraries />} />
      <Route path="/libraries/:id"   element={<LibraryDetail />} />

      {/* Utilisateur */}
      <Route path="/dashboard"   element={<RequireAuth roles={['user']}><UserDashboard /></RequireAuth>} />
      <Route path="/my-borrows"  element={<RequireAuth roles={['user']}><MyBorrows /></RequireAuth>} />
      <Route path="/profile"     element={<RequireAuth roles={['user']}><UserProfile /></RequireAuth>} />

      {/* Bibliothèque */}
      <Route path="/lib/dashboard" element={<RequireAuth roles={['library']}><LibDashboard /></RequireAuth>} />
      <Route path="/lib/books"     element={<RequireAuth roles={['library']}><LibBooks /></RequireAuth>} />
      <Route path="/lib/borrows"   element={<RequireAuth roles={['library']}><LibBorrows /></RequireAuth>} />
      <Route path="/lib/profile"   element={<RequireAuth roles={['library']}><LibProfile /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin"            element={<RequireAuth roles={['admin']}><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/libraries"  element={<RequireAuth roles={['admin']}><AdminLibraries /></RequireAuth>} />
      <Route path="/admin/books"      element={<RequireAuth roles={['admin']}><AdminBooks /></RequireAuth>} />
      <Route path="/admin/users"      element={<RequireAuth roles={['admin']}><AdminUsers /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
