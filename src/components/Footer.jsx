import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/dev" className="footer-link">Área do Desenvolvedor</Link>
        </div>
        <p className="footer-text">© 2024 Sistema de Ranking das Tribos</p>
      </div>
    </footer>
  );
}

export default Footer; 