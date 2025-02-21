import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../url";
import "../styles/AddMember.css";

function AddMember() {
  const [name, setName] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [selectedTribo, setSelectedTribo] = useState("");
  const [tribos, setTribos] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [membros, setMembros] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Estados para login do secretário
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [secretario, setSecretario] = useState("");
  const [password, setPassword] = useState("");
  const [loginData, setLoginData] = useState(null);

  // Adicionar estado para controlar dias permitidos
  const [isDiaPermitido, setIsDiaPermitido] = useState(false);

  useEffect(() => {
    fetchTribos();
  }, []);

  useEffect(() => {
    if (selectedTribo) {
      fetchMembrosTribo(selectedTribo);
    }
  }, [selectedTribo]);

  // Verificar se o dia atual é permitido para registro de frequência
  useEffect(() => {
    const verificarDiaPermitido = () => {
      const hoje = new Date().getDay();
      // 4 = quinta, 5 = sexta, 6 = sábado, 0 = domingo
      const diasPermitidos = [4, 5, 6, 0];
      setIsDiaPermitido(diasPermitidos.includes(hoje));
    };

    verificarDiaPermitido();
  }, []);

  const fetchTribos = async () => {
    try {
      const response = await axios.get(`${url}/api/tribes`);
      setTribos(response.data);
    } catch (err) {
      console.error("Erro ao buscar tribos:", err);
      setError("Erro ao carregar tribos");
    }
  };

  const fetchMembrosTribo = async (tribo) => {
    try {
      console.log("Buscando membros da tribo:", tribo); // Debug

      const response = await axios.get(
        `${url}/api/members/tribo/${encodeURIComponent(tribo)}`
      );

      console.log("Resposta da API:", response.data); // Debug

      // Garantir que estamos usando o array de membros da resposta
      if (response.data && Array.isArray(response.data.membros)) {
        const membrosOrdenados = response.data.membros.sort((a, b) =>
          a.nomemembro.localeCompare(b.nomemembro)
        );
        setMembros(membrosOrdenados);
      } else {
        console.log("Nenhum membro encontrado ou formato inválido", response.data);
        setMembros([]);
      }
    } catch (err) {
      console.error("Erro ao buscar membros:", err);
      setError("Erro ao carregar membros da tribo");
      setMembros([]);
    }
  };

  // Verificar login salvo ao carregar a página
  useEffect(() => {
    const savedLoginData = localStorage.getItem("secretarioLogin");
    if (savedLoginData) {
      const loginInfo = JSON.parse(savedLoginData);
      setIsLoggedIn(true);
      setLoginData(loginInfo);
      setSecretario(loginInfo.secretario);
      setSelectedTribo(loginInfo.tribo);
    }
  }, []);

  // Buscar membros da tribo ao fazer login
  useEffect(() => {
    if (isLoggedIn && loginData?.tribo) {
      fetchMembrosTribo(loginData.tribo);
    }
  }, [isLoggedIn, loginData, success]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedTribo || !secretario || !password) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    try {
      // Primeiro fazer a requisição de login
      const response = await axios.post(`${url}/api/login`, {
        secretario,
        password,
        tribo: selectedTribo,
      });

      if (response.data.success) {
        // Se o login for bem sucedido, salvar os dados e atualizar o estado
        localStorage.setItem("secretarioLogin", JSON.stringify(response.data));
        setIsLoggedIn(true);
        setLoginData(response.data);
        setError("");

        // Buscar membros da tribo após login bem sucedido
        await fetchMembrosTribo(selectedTribo);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response.data.error || "Credenciais inválidas");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
      console.error("Erro no login:", err);
    }
  };

  const handleLogout = () => {
    // Limpar dados do login
    localStorage.removeItem("secretarioLogin");
    setIsLoggedIn(false);
    setLoginData(null);
    setSecretario("");
    setPassword("");
    setSelectedTribo("");
    setError("");
    setMembros([]);
    setSelectedMembers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(`${url}/api/members`, {
        name,
        endereco,
        telefone,
        tribo: loginData.tribo,
      });

      setSuccess("Membro adicionado com sucesso!");
      setName("");
      setEndereco("");
      setTelefone("");
      
      // Atualizar a lista de membros
      await fetchMembrosTribo(loginData.tribo);
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
      setError(err.response?.data?.error || "Erro ao adicionar membro");
    }
  };

  const handleFrequenciaSubmit = async (e) => {
    if (e) e.preventDefault();
    
    setError("");
    setSuccess("");

    if (!isDiaPermitido) {
      setError("Frequência só pode ser registrada de quinta a domingo");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Selecione pelo menos um membro");
      return;
    }

    if (!loginData?.tribo) {
      setError("Erro: Tribo não identificada");
      return;
    }

    try {
      console.log('Enviando dados:', {
        membros: selectedMembers,
        tribo: loginData.tribo
      });

      const response = await axios.post(`${url}/api/frequencia`, {
        membros: selectedMembers,
        tribo: loginData.tribo,
      });

      console.log('Resposta:', response.data);

      if (response.data.membrosJaRegistrados > 0) {
        setSuccess(
          `Frequência registrada com sucesso para ${response.data.membrosRegistrados} membro(s). ` +
          `${response.data.membrosJaRegistrados} membro(s) já tinham presença registrada hoje.`
        );
      } else {
        setSuccess(`Frequência registrada com sucesso para ${response.data.membrosRegistrados} membro(s)!`);
      }

      setSelectedMembers([]); // Limpar seleção
      await fetchMembrosTribo(loginData.tribo); // Atualizar lista

    } catch (err) {
      console.error("Erro ao registrar frequência:", err);
      
      if (err.response) {
        // O servidor respondeu com um status de erro
        if (err.response.status === 400) {
          setError(err.response.data.error || "Erro ao validar dados da frequência");
        } else if (err.response.status === 401) {
          setError("Sessão expirada. Por favor, faça login novamente.");
          handleLogout();
        } else if (err.response.status === 404) {
          setError("Tribo não encontrada");
        } else {
          setError(`Erro do servidor: ${err.response.data.error || 'Erro desconhecido'}`);
        }
      } else if (err.request) {
        // A requisição foi feita mas não houve resposta
        setError("Erro de conexão com o servidor. Verifique sua internet.");
      } else {
        // Erro na configuração da requisição
        setError("Erro ao preparar requisição. Tente novamente.");
      }
    }
  };

  const handleMemberSelect = (idmembro) => {
    setSelectedMembers((prev) =>
      prev.includes(idmembro)
        ? prev.filter((id) => id !== idmembro)
        : [...prev, idmembro]
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>Login do Secretário</h1>
        <form onSubmit={handleLogin} className="login-form">
          <select
            value={selectedTribo}
            onChange={(e) => setSelectedTribo(e.target.value)}
            required
          >
            <option value="">Selecione sua tribo</option>
            {tribos.map((tribo) => (
              <option key={tribo.idtribos} value={tribo.nometribos}>
                {tribo.nometribos}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={secretario}
            onChange={(e) => setSecretario(e.target.value)}
            placeholder="Nome do Secretário"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
          />

          <button type="submit">Entrar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-with-logout">
        <h1>Adicionar Novo Membro</h1>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </div>

      <div className="secretary-info">
        <p>
          Secretário: {loginData.secretario}
          <br />
          Tribo: {loginData.tribo}
        </p>
      </div>

      <div className="required-fields">
        <span>*</span> Campos obrigatórios
      </div>

      <div className="content-section">
        <form onSubmit={handleSubmit} className="add-member-form">
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Endereço:</label>
            <input
              type="text"
              placeholder="Rua, Avenida, etc."
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone:</label>
            <input
              type="number"
              placeholder="(00) 00000-0000"
              min="10"
              max="11"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={!selectedTribo}>
            Adicionar Membro
          </button>
        </form>

        <div className="frequencia-section">
          <h2>Lista de Frequência</h2>
          {!isDiaPermitido && (
            <div className="warning-message">
              Registro de frequência disponível apenas de quinta a domingo
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {membros.length === 0 ? (
            <p className="no-members">Nenhum membro cadastrado nesta tribo</p>
          ) : (
            <>
              <div className="membros-list">
                {membros.map((membro) => (
                  <div key={membro.idmembro} className="membro-item">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(membro.idmembro)}
                        onChange={() => handleMemberSelect(membro.idmembro)}
                        disabled={!isDiaPermitido}
                      />
                      <span className="membro-presencas">{membro.totalpresencas || 0}</span>
                      <span className="membro-nome">{membro.nomemembro}</span>
                      {membro.ultima_presenca && (
                        <span className="ultima-presenca">
                          Última presença: {new Date(membro.ultima_presenca).toLocaleDateString()}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleFrequenciaSubmit}
                className="register-frequencia-button"
                disabled={!isDiaPermitido || selectedMembers.length === 0}
              >
                Registrar Frequência ({selectedMembers.length} selecionados)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddMember;
