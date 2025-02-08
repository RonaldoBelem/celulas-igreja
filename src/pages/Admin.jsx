import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../url";


function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [username, setUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTribo, setSelectedTribo] = useState("todas");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verificar login salvo ao carregar a página
  useEffect(() => {
    const savedAdminData = localStorage.getItem("adminLogin");
    if (savedAdminData) {
      const adminInfo = JSON.parse(savedAdminData);
      setIsLoggedIn(true);
      setAdminData(adminInfo.admin);
      fetchMembers();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        `${url}/admin/login`,
        {
          username: username.trim(),
          password: adminPassword,
        }
      );

      if (response.data.success) {
        localStorage.setItem("adminLogin", JSON.stringify(response.data));
        setIsLoggedIn(true);
        setAdminData(response.data);
        fetchMembers();
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.response?.data?.error || "Erro ao fazer login");
    }
  };

  const handleLogout = () => {
    // Limpar dados do login
    localStorage.removeItem("adminLogin");
    setIsLoggedIn(false);
    setAdminData(null);
    setUsername("");
    setAdminPassword("");
    setMembers([]);
    setSearchTerm("");
    setSelectedTribo("todas");
    setError(null);
  };

  const tribes = [
    "Todas",
    "Ruben",
    "Simeao",
    "Levi",
    "Juda",
    "Efraim",
    "Naftali",
    "Gade",
    "Aser",
    "Issacar",
    "Zebulom",
    "Manasses",
    "Benjamim",
  ];

  const fetchMembers = async (tribe = "todas", search = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${url}/api/admin/members?tribe=${tribe}&search=${search}`
      );
      setMembers(response.data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers(selectedTribo, searchTerm);
  };

  const handleTriboChange = (e) => {
    const tribo = e.target.value.toLowerCase();
    setSelectedTribo(tribo);
    fetchMembers(tribo, searchTerm);
  };

  return (
    <div className="container admin-panel">
      {!isLoggedIn ? (
        <div className="admin-login">
          <h1>Área Administrativa</h1>
          <form onSubmit={handleLogin} className="admin-form">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de usuário"
              required
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Senha"
              required
            />
            <button className="bt-adm" type="submit">Entrar</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      ) : (
        <>
          <div className="header-with-logout">
            <h1>Painel Administrativo</h1>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>

          <p className="admin-info">Administrador: {adminData?.username}</p>

          <div className="search-filters">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar membro..."
                className="search-input"
              />
              <select
                value={selectedTribo}
                onChange={handleTriboChange}
                className="tribe-select"
              >
                {tribes.map((tribe) => (
                  <option key={tribe} value={tribe.toLowerCase()}>
                    {tribe}
                  </option>
                ))}
              </select>
              <button type="submit">Buscar</button>
            </form>
          </div>

          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="members-table">
              <div className="table-header">
                <span>Nome</span>
                <span>Tribo</span>
                <span>Endereço</span>
                <span>Telefone</span>
                <span>Data de Entrada</span>
              </div>
              {members.length === 0 ? (
                <p>Nenhum membro encontrado</p>
              ) : (
                members.map((member) => (
                  <div key={member.idmembro} className="table-row">
                    <span>{member.nomemembro}</span>
                    <span>{member.nometribos}</span>
                    <span>{member.endereco || "-"}</span>
                    <span>{member.telefone || "-"}</span>
                    <span>
                      {new Date(member.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Admin;
