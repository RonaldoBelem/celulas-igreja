import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { url } from "../url";

function Ranking() {
  const [rankingData, setRankingData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("semanal");

  const Medal = ({ position }) => {
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
    return <span className="medal">{medals[position]}</span>;
  };

  const getEndpoint = (period) => {
    const endpoints = {
      semanal: "/api/tabela_semanal",
      mensal: "/api/tabela_mensal",
      anual: "/api/tabela_anual",
    };
    return endpoints[period] || endpoints.semanal;
  };

  const sortRankingData = (data) => {
    return data.sort((a, b) => {
      const totalDiff = (b.total || 0) - (a.total || 0);
      if (totalDiff !== 0) return totalDiff;

      const membrosDiff = (b.novos_membros || 0) - (a.novos_membros || 0);
      if (membrosDiff !== 0) return membrosDiff;

      const presencasDiff = (b.presencas || 0) - (a.presencas || 0);
      if (presencasDiff !== 0) return presencasDiff;

      return a.nometribos.localeCompare(b.nometribos);
    });
  };

  const removeDuplicates = (data) => {
    return data.filter(
      (tribe, index, self) =>
        index === self.findIndex((t) => t.nometribos === tribe.nometribos)
    );
  };

  const fetchRanking = async (period) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${url}${getEndpoint(period)}`);
      const sortedData = sortRankingData(response.data);
      const uniqueData = removeDuplicates(sortedData);
      
      setRankingData(uniqueData);
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
        {["semanal", "mensal", "anual"].map((period) => (
          <button
            key={period}
            className={selectedPeriod === period ? "active" : ""}
            onClick={() => setSelectedPeriod(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">Carregando...</div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => fetchRanking(selectedPeriod)}>Tentar Novamente</button>
        </div>
      ) : rankingData.length === 0 ? (
        <p className="no-data">Nenhum dado disponível no período selecionado.</p>
      ) : (
        <div className="ranking-table">
          <div className="table-header">
            <span>Posição</span>
            <span>Tribo</span>
            <span>Novos Membros</span>
            <span>Presenças</span>
            <span>Total de Pontos</span>
          </div>

          {rankingData.map((tribe, index) => (
            <div key={index} className="table-row">
              <span className="position">
                {index + 1}º {index < 3 && <Medal position={index + 1} />}
              </span>
              <span>
                <Link to={`/tribo/${encodeURIComponent(tribe.nometribos?.toLowerCase())}`} className="tribo-link">
                  {tribe.nometribos}
                </Link>
              </span>
              <span>{tribe.novos_membros || 0}</span>
              <span>{tribe.presencas || 0}</span>
              <span>{tribe.total || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Ranking;
