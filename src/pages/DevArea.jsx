import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../url";

function DevArea() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'member' ou 'tribe'
  const [passwordMessage, setPasswordMessage] = useState("");
  const [tribos, setTribos] = useState([]);
  const [editingSenha, setEditingSenha] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Adicionar esta função para criar o config com o token
  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("devToken")}`,
    },
  });

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("devToken");
      if (token) {
        try {
          const config = getAuthConfig();
          await axios.get(`${url}/dev/tribes`, config);
          setIsAuthenticated(true);
          await fetchData();
        } catch (err) {
          console.error("Erro na autenticação:", err);
          localStorage.removeItem("devToken");
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTribos();
    }
  }, [isAuthenticated]);

  // Login do desenvolvedor
  const handleDevLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log('Tentando login em:', `${url}/dev/login`);
      console.log('Com dados:', { username });

      const response = await axios.post(`${url}/dev/login`, {
        username,
        password,
      });

      console.log('Resposta do servidor:', response.data);

      if (response.data.success) {
        localStorage.setItem("devToken", response.data.token);
        setIsAuthenticated(true);
        await fetchData();
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.response?.data?.error || "Credenciais inválidas");
    }
  };

  // Buscar dados
  const fetchData = async () => {
    try {
      const config = getAuthConfig();
      const [membersRes, tribesRes] = await Promise.all([
        axios.get(`${url}/dev/members`, config),
        axios.get(`${url}/dev/tribes`, config)
      ]);
      setMembers(membersRes.data);
      setTribes(tribesRes.data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Erro ao carregar dados");
    }
  };

  // Excluir membro
  const handleDeleteMember = async (memberId) => {
    if (window.confirm("Tem certeza que deseja excluir este membro?")) {
      try {
        await axios.delete(
          `${url}/dev/members/${memberId}`,
          getAuthConfig()
        );
        fetchData();
      } catch (err) {
        setError("Erro ao excluir membro");
      }
    }
  };

  // Duplicar tribo
  const handleDuplicateTribe = async (tribe) => {
    try {
      let newTribeName = tribe.nometribos;
      let counter = 1;

      while (tribes.some((t) => t.nometribos === `${newTribeName}${counter}`)) {
        counter++;
      }

      newTribeName = `${newTribeName}${counter}`;

      const response = await axios.post(
        `${url}/dev/tribes/duplicate`,
        {
          originalTriboId: tribe.idtribos,
          newTribeName: newTribeName,
          nomelider: `Líder ${newTribeName}`,
          norevicelider: `Vice-líder ${newTribeName}`,
          nomesecretario: `Secretário ${newTribeName}`,
        },
        getAuthConfig()
      );

      if (response.data.success) {
        alert(
          `Tribo duplicada com sucesso!\n\nTribo: ${response.data.details.tribo}\nSecretário: ${response.data.details.secretario}\nSenha inicial: ${response.data.details.senhaInicial}`
        );
        fetchData();
      }
    } catch (err) {
      setError("Erro ao duplicar tribo");
    }
  };

  // Atualizar membro
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${url}/dev/members/${selectedMember.idmembro}`,
        {
          nomemembro: selectedMember.nomemembro,
          idtribos: selectedMember.idtribos,
          telefone: selectedMember.telefone,
          endereco: selectedMember.endereco,
        },
        getAuthConfig()
      );
      setSelectedMember(null);
      setEditMode(null);
      fetchData();
    } catch (err) {
      setError("Erro ao atualizar membro");
    }
  };

  // Atualizar tribo
  const handleUpdateTribe = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${url}/dev/tribes/${selectedTribe.idtribos}`,
        {
          nomelider: selectedTribe.nomelider,
          norevicelider: selectedTribe.norevicelider,
          nomesecretario: selectedTribe.nomesecretario,
        },
        getAuthConfig()
      );
      setSelectedTribe(null);
      setEditMode(null);
      fetchData();
    } catch (err) {
      setError("Erro ao atualizar tribo");
    }
  };

  // Atualizar senha
  const handleUpdatePassword = async (e, type, id) => {
    e.preventDefault();
    try {
      await axios.put(
        `${url}/dev/password/${type}/${id}`,
        {
          newPassword: e.target.password.value,
        },
        getAuthConfig()
      );
      alert("Senha atualizada com sucesso!");
    } catch (err) {
      setError("Erro ao atualizar senha");
    }
  };

  // Adicionar esta função
  const handleDeleteTribe = async (tribe) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a tribo ${tribe.nometribos}?\n\nAtenção: Esta ação irá excluir:\n- Todos os membros da tribo\n- Dados do secretário\n- Senhas e configurações\n\nEsta ação não pode ser desfeita!`
      )
    ) {
      try {
        const response = await axios.delete(
          `${url}/dev/tribes/${tribe.idtribos}`,
          getAuthConfig()
        );

        if (response.data.success) {
          setPasswordMessage(response.data.message);
          await fetchData();
        } else {
          setError("Erro ao excluir tribo");
        }
      } catch (err) {
        console.error("Erro ao excluir tribo:", err);
        setError(err.response?.data?.error || "Erro ao excluir tribo");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("devToken");
    setIsAuthenticated(false);
    setMembers([]);
    setTribes([]);
  };

  // Adicionar esta função no componente DevArea
  const testSecretaryLogins = async () => {
    try {
      const response = await axios.get(
        `${url}/dev/test-secretaries`,
        getAuthConfig()
      );

      const secretaries = response.data;
      console.table(secretaries);

      // Testar login de cada secretário
      for (const secretary of secretaries) {
        try {
          const loginResponse = await axios.post(
            `${url}/login`,
            {
              secretario: secretary.secretario,
              tribo: secretary.tribo,
              password: `${secretary.tribo.toLowerCase()}123`, // senha padrão
            }
          );

          console.log(
            `Login ${secretary.tribo}:`,
            loginResponse.data.success ? "OK" : "Falhou"
          );
        } catch (err) {
          console.log(
            `Login ${secretary.tribo}:`,
            "Falhou -",
            err.response?.data?.error || err.message
          );
        }
      }
    } catch (err) {
      console.error("Erro ao testar logins:", err);
    }
  };

  const fetchTribos = async () => {
    try {
      const config = getAuthConfig();
      const response = await axios.get(`${url}/dev/tribes`, config);
      setTribos(response.data);
    } catch (err) {
      setError("Erro ao carregar tribos");
    }
  };

  const handleUpdateSenha = async (tribo) => {
    try {
      const config = getAuthConfig();
      const response = await axios.put(
        `${url}/dev/update-senha`,
        {
          idtribos: tribo.idtribos,
          senha: editingSenha.novaSenha
        },
        config
      );

      if (response.data.success) {
        setPasswordMessage(`Senha atualizada com sucesso para a tribo ${tribo.nometribos}`);
        setEditingSenha(null);
        fetchTribos();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar senha");
    }
  };

  const handleUpdateSecretario = async (tribo) => {
    try {
      if (!editingSenha.novoSecretario?.trim()) {
        setError("Nome do secretário é obrigatório");
        return;
      }

      const config = getAuthConfig();
      const dados = {
        idtribos: tribo.idtribos,
        nomesecretario: editingSenha.novoSecretario.trim(),
        senha: editingSenha.novaSenha?.trim() || null
      };

      console.log('Enviando dados:', dados); // Para debug

      const response = await axios.put(
        `${url}/dev/update-secretario`,
        dados,
        config
      );

      if (response.data.success) {
        setPasswordMessage(response.data.message);
        setEditingSenha(null);
        setError("");
        await fetchTribos();
      }
    } catch (err) {
      console.error('Erro:', err);
      setError(err.response?.data?.error || "Erro ao atualizar secretário");
    }
  };

  const testarRankingSemanal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getAuthConfig();
      
      const response = await axios.post(
        `${url}/dev/test-ranking-semanal`,
        {},
        config
      );
      
      setResultado(response.data);
      console.log('Resultado do teste semanal:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao testar ranking semanal');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const testarRankingMensal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getAuthConfig();
      
      const response = await axios.post(
        `${url}/dev/test-ranking-mensal`,
        {},
        config
      );
      
      setResultado(response.data);
      console.log('Resultado do teste mensal:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao testar ranking mensal');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const testarRankingAnual = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getAuthConfig();
      
      const response = await axios.post(
        `${url}/dev/test-ranking-anual`,
        {},
        config
      );
      
      setResultado(response.data);
      console.log('Resultado do teste anual:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao testar ranking anual');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container dev-login">
        <h1>Área do Desenvolvedor</h1>
        <form onSubmit={handleDevLogin}>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Entrar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container dev-area">
      <div className="header-with-logout">
        <h1>Área do Desenvolvedor</h1>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </div>

      {/* Gerenciamento de Membros */}
      <section className="dev-section">
        <h2>Gerenciar Membros</h2>
        {editMode === "member" && selectedMember && (
          <form onSubmit={handleUpdateMember} className="edit-form">
            <div className="form-row">
              <input
                type="text"
                value={selectedMember.nomemembro}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    nomemembro: e.target.value,
                  })
                }
                placeholder="Nome do Membro"
              />

              <select
                value={selectedMember.idtribos}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    idtribos: e.target.value,
                  })
                }
              >
                {tribes.map((tribe) => (
                  <option key={tribe.idtribos} value={tribe.idtribos}>
                    {tribe.nometribos}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <input
                type="tel"
                value={selectedMember.telefone || ""}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    telefone: e.target.value,
                  })
                }
                placeholder="Telefone"
              />

              <input
                type="text"
                value={selectedMember.endereco || ""}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    endereco: e.target.value,
                  })
                }
                placeholder="Endereço"
              />
            </div>

            <div className="form-buttons">
              <button type="submit">Salvar</button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null);
                  setEditMode(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tribo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.idmembro}>
                <td>{member.nomemembro}</td>
                <td>{member.nometribos}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setEditMode("member");
                    }}
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDeleteMember(member.idmembro)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Gerenciamento de Tribos */}
      <section className="dev-section">
        <h2>Gerenciar Tribos</h2>
        {editMode === "tribe" && selectedTribe && (
          <form onSubmit={handleUpdateTribe} className="edit-form">
            <input
              type="text"
              value={selectedTribe.nomelider}
              onChange={(e) =>
                setSelectedTribe({
                  ...selectedTribe,
                  nomelider: e.target.value,
                })
              }
              placeholder="Nome do Líder"
            />
            <input
              type="text"
              value={selectedTribe.norevicelider}
              onChange={(e) =>
                setSelectedTribe({
                  ...selectedTribe,
                  norevicelider: e.target.value,
                })
              }
              placeholder="Nome do Vice-líder"
            />
            <input
              type="text"
              value={selectedTribe.nomesecretario}
              onChange={(e) =>
                setSelectedTribe({
                  ...selectedTribe,
                  nomesecretario: e.target.value,
                })
              }
              placeholder="Nome do Secretário"
            />
            <button type="submit">Salvar</button>
            <button
              type="button"
              onClick={() => {
                setSelectedTribe(null);
                setEditMode(null);
              }}
            >
              Cancelar
            </button>
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>Tribo</th>
              <th>Líder</th>
              <th>Vice-líder</th>
              <th>Secretário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tribes.map((tribe) => (
              <tr key={tribe.idtribos}>
                <td>{tribe.nometribos}</td>
                <td>{tribe.nomelider}</td>
                <td>{tribe.norevicelider}</td>
                <td>{tribe.nomesecretario}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedTribe(tribe);
                      setEditMode("tribe");
                    }}
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDuplicateTribe(tribe)}>
                    Duplicar
                  </button>
                  <button
                    onClick={() => handleDeleteTribe(tribe)}
                    className="delete-button"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Testar Logins */}
      <div className="dev-section">
        <h2>Testar Logins</h2>
        <button onClick={testSecretaryLogins}>
          Testar Login dos Secretários
        </button>
      </div>

      {/* Gerenciar Secretários e Senhas */}
      <div className="dev-section">
        <h2>Gerenciar Secretários e Senhas</h2>
        {error && <p className="error-message">{error}</p>}
        {passwordMessage && <p className="success-message">{passwordMessage}</p>}
        <table>
          <thead>
            <tr>
              <th>Tribo</th>
              <th>Secretário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tribos.map((tribo) => (
              <tr key={tribo.idtribos}>
                <td>{tribo.nometribos}</td>
                <td>{tribo.nomesecretario}</td>
                <td>
                  {editingSenha?.idtribos === tribo.idtribos ? (
                    <div className="secretario-edit">
                      <input
                        type="text"
                        value={editingSenha.novoSecretario}
                        onChange={(e) => setEditingSenha({
                          ...editingSenha,
                          novoSecretario: e.target.value
                        })}
                        placeholder="Novo nome do secretário"
                        className="input-secretario"
                      />
                      <input
                        type="password"
                        value={editingSenha.novaSenha}
                        onChange={(e) => setEditingSenha({
                          ...editingSenha,
                          novaSenha: e.target.value
                        })}
                        placeholder="Nova senha"
                        className="input-senha"
                      />
                      <button 
                        className="btn-save"
                        onClick={() => handleUpdateSecretario(tribo)}
                      >
                        Salvar
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => setEditingSenha(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-edit"
                      onClick={() => setEditingSenha({
                        idtribos: tribo.idtribos,
                        novoSecretario: tribo.nomesecretario,
                        novaSenha: ""
                      })}
                    >
                      Editar Secretário
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="test-section">
        <h2>Testes de Ranking</h2>
        
        {/* Teste Ranking Semanal */}
        <div className="ranking-test">
          <h3>Ranking Semanal</h3>
          <button 
            onClick={testarRankingSemanal}
            disabled={loading}
          >
            {loading ? 'Testando...' : 'Testar Ranking Semanal'}
          </button>
        </div>

        {/* Teste Ranking Mensal */}
        <div className="ranking-test">
          <h3>Ranking Mensal</h3>
          <button 
            onClick={testarRankingMensal}
            disabled={loading}
          >
            {loading ? 'Testando...' : 'Testar Ranking Mensal'}
          </button>
        </div>

        {/* Teste Ranking Anual */}
        <div className="ranking-test">
          <h3>Ranking Anual</h3>
          <button 
            onClick={testarRankingAnual}
            disabled={loading}
          >
            {loading ? 'Testando...' : 'Testar Ranking Anual'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {resultado && (
          <div className="result-section">
            <h3>Resultado do Teste</h3>
            {resultado.semana && <p>Semana: {resultado.semana}</p>}
            {resultado.mes && <p>Mês: {resultado.mes}</p>}
            {resultado.ano && <p>Ano: {resultado.ano}</p>}
            <table>
              <thead>
                <tr>
                  <th>Tribo</th>
                  <th>Novos Membros</th>
                  <th>Presenças</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {resultado.data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nometribos}</td>
                    <td>{item.novos_membros}</td>
                    <td>{item.presencas}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DevArea;
