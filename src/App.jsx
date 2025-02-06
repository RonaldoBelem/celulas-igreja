import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddMember from "./pages/AddMember";
import Ranking from "./pages/Ranking";
import TriboDetalhes from "./pages/TriboDetalhes";
import Admin from "./pages/Admin";
import DevArea from "./pages/DevArea";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav>
          <Link to="/">Ranking</Link>
          <Link to="/add-member">Adicionar Membro</Link>
          <Link to="/admin">Admin</Link>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Ranking />} />
            <Route path="/add-member" element={<AddMember />} />
            <Route path="/tribo/:nomeTribo" element={<TriboDetalhes />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dev" element={<DevArea />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
