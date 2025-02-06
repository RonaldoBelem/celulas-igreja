import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "../url";

function Login() {
  const [secretario, setSecretario] = useState("");
  const [password, setPassword] = useState("");
  const [tribo, setTribo] = useState("");
  const [error, setError] = useState("");
  const [tribes, setTribes] = useState([]);
  const navigate = useNavigate();

  // Buscar tribos ao carregar o componente
  useEffect(() => {
    const fetchTribes = async () => {
      try {
        const response = await axios.get(
          `${url}/members/tribes`
        );
        setTribes(response.data);
      } catch (err) {
        console.error("Erro ao buscar tribos:", err);
        setError("Erro ao carregar tribos");
      }
    };

    fetchTribes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${url}/login`, {
        secretario,
        password,
        tribo,
      });

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/members");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao fazer login");
    }
  };

  return (
    <div className="container login-container">
      <h1>Login do Secretário</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={tribo}
          onChange={(e) => setTribo(e.target.value)}
          required
        >
          <option value="">Selecione a Tribo</option>
          {tribes.map((tribe) => (
            <option key={tribe.nometribos} value={tribe.nometribos}>
              {tribe.nometribos}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nome do Secretário"
          value={secretario}
          onChange={(e) => setSecretario(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
