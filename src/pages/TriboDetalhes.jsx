import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "../url";
import "../styles/TriboDetalhes.css";

function TriboDetalhes() {
  const [tribo, setTribo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { nomeTribo } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTriboDetalhes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Buscando detalhes da tribo:", nomeTribo); // Debug

        const response = await axios.get(
          `${url}/api/members/tribo/${encodeURIComponent(nomeTribo.toLowerCase())}`
        );

        console.log("Resposta do servidor:", response.data); // Debug
        setTribo(response.data);
      } catch (err) {
        console.error("Erro ao carregar detalhes da tribo:", err);
        setError(
          err.response?.data?.error || "Erro ao carregar os detalhes da tribo."
        );
      } finally {
        setLoading(false);
      }
    };

    if (nomeTribo) {
      fetchTriboDetalhes();
    }
  }, [nomeTribo]);

  const handleVoltar = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container tribo-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando detalhes da tribo...</p>
        </div>
      </div>
    );
  }

  if (error || !tribo) {
    return (
      <div className="container tribo-container">
        <div className="error-box">
          <p className="error-message">{error || "Tribo não encontrada"}</p>
          <button onClick={handleVoltar} className="voltar-button">
            Voltar ao Ranking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container tribo-container">
      <div className="tribo-header">
        <h1 className="tribo-titulo">{tribo.nometribos}</h1>
        <div className="tribo-simbolo">
          <img
            src={`/simbolos/${nomeTribo.toLowerCase()}.png`}
            alt={`Símbolo da tribo ${tribo.nometribos}`}
            onError={(e) => {
              e.target.src = "/simbolos/default.svg";
              e.target.onerror = null;
            }}
          />
        </div>
      </div>

      <div className="tribo-info-grid">
        <div className="info-card lider">
          <div className="card-icon">👑</div>
          <h3>Líder</h3>
          <p>{tribo.nomelider || "Não definido"}</p>
        </div>

        <div className="info-card vice-lider">
          <div className="card-icon">⭐</div>
          <h3>Vice-líder</h3>
          <p>{tribo.norevicelider || "Não definido"}</p>
        </div>

        <div className="info-card secretario">
          <div className="card-icon">📝</div>
          <h3>Secretário</h3>
          <p>{tribo.nomesecretario || "Não definido"}</p>
        </div>

        <div className="info-card membros">
          <div className="card-icon">👥</div>
          <h3>Total de Membros</h3>
          <p className="membros-count">{tribo.total_membros || 0}</p>
        </div>
      </div>

      {tribo.membros && tribo.membros.length > 0 && (
        <div className="membros-lista">
          <h2>Lista de Membros</h2>
          <div className="membros-grid">
            {tribo.membros.map((membro) => (
              <div key={membro.idmembro} className="membro-card">
                <h3>{membro.nomemembro}</h3>
                <p>Entrou em: {new Date(membro.dataentrada).toLocaleDateString()}</p>
                <p>Total de presenças: {membro.totalpresencas}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleVoltar} className="voltar-button">
        ← Voltar ao Ranking
      </button>
    </div>
  );
}

export default TriboDetalhes;
