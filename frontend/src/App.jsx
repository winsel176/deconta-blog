import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import NotFound from "./pages/NotFound.jsx";
import Privacy from "./pages/Privacy.jsx";
import Cookies from "./pages/Cookies.jsx";
import Contact from "./pages/Contact.jsx";

import Home from "./pages/Home.jsx";
import Blog from "./pages/Blog.jsx";
import Post from "./pages/Post.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Write from "./pages/Write.jsx";
import Profile from "./pages/Profile.jsx";
import HelpChat from "./components/HelpChat.jsx";
import TermsPage from "./pages/Terms.jsx";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
<Route path="/terminos" element={<TermsPage />} />
<Route path="/privacidad" element={<Privacy />} />
<Route path="/cookies" element={<Cookies />} />
<Route path="/contacto" element={<Contact />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Post />} />

        {/* ✅ Cursos: soporta /courses y /course si lo usas */}

        {/* ✅ Si quieres mantener /cursos también, lo redirigimos */}

        {/* IA page (si todavía existe) */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/write" element={<Write />} />
        <Route path="/profile" element={<Profile />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
<HelpChat />

      <Footer />
    </>
  );
}
<Route path="*" element={<NotFound />} />
