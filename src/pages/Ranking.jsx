import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { url } from "../url";

function Ranking() {
  const [rankingData, setRankingData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("semanal");

  // Componente para medalhas
  const Medal = ({ position }) => {
    const medals = {
      1: "🥇",
      2: "🥈",
      3: "🥉",
    };
    return <span className="medal">{medals[position]}</span>;
  };

  const fetchRanking = async (period) => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint;
      switch (period) {
        case "semanal":
          endpoint = "/api/tabela_semanal";
          break;
        case "mensal":
          endpoint = "/api/tabela_mensal";
          break;
        case "anual":
          endpoint = "/api/tabela_anual";
          break;
        default:
          endpoint = "/api/tabela_semanal";
      }

      const response = await axios.get(`${url}/api/${endpoint}`);
      
      // Ordenar o ranking por total de pontos (decrescente) e depois por total de membros (decrescente)
      const sortedData = response.data.sort((a, b) => {
        // Primeiro critério: total de pontos
        const totalDiff = (b.total || 0) - (a.total || 0);
        if (totalDiff !== 0) return totalDiff;

        // Segundo critério: número de novos membros
        const membrosDiff = (b.novos_membros || 0) - (a.novos_membros || 0);
        if (membrosDiff !== 0) return membrosDiff;

        // Terceiro critério: número de presenças
        const presencasDiff = (b.presencas || 0) - (a.presencas || 0);
        if (presencasDiff !== 0) return presencasDiff;

        // Se ainda houver empate, ordenar por ordem alfabética
        return a.nometribos.localeCompare(b.nometribos);
      });

      setRankingData(sortedData);
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
      setError("Não foi possível carregar o ranking. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking(selectedPeriod);
  }, [selectedPeriod]);

  return (
    <div className="container">
      <h1>Ranking das Tribos</h1>

      <div className="period-buttons">
        <button
          className={selectedPeriod === "semanal" ? "active" : ""}
          onClick={() => setSelectedPeriod("semanal")}
        >
          Semanal
        </button>
        <button
          className={selectedPeriod === "mensal" ? "active" : ""}
          onClick={() => setSelectedPeriod("mensal")}
        >
          Mensal
        </button>
        <button
          className={selectedPeriod === "anual" ? "active" : ""}
          onClick={() => setSelectedPeriod("anual")}
        >
          Anual
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Carregando...</div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="ranking-table">
          <div className="table-header">
            <span>Posição</span>
            <span>Tribo</span>
            <span>Novos Membros</span>
            <span>Presenças</span>
            <span>Total de Pontos</span>
          </div>

          {rankingData.length === 0 ? (
            <p className="no-data">
              Nenhum dado disponível no período selecionado.
            </p>
          ) : (
            rankingData.map((tribe, index) => (
              <div key={index} className="table-row">
                <span className="position">
                  {index + 1}º{index < 3 && <Medal position={index + 1} />}
                </span>
                <span>
                  <Link
                    to={`/tribo/${encodeURIComponent(
                      tribe.nometribos?.toLowerCase()
                    )}`}
                    className="tribo-link"
                  >
                    {tribe.nometribos}
                  </Link>
                </span>
                <span>{tribe.novos_membros || 0}</span>
                <span>{tribe.presencas || 0}</span>
                <span>{tribe.total || 0}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Ranking;
