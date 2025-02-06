import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../url";

function GerenciarTribos() {
  const [tribos, setTribos] = useState([]);
  const [editingTribo, setEditingTribo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTribos();
  }, []);

  const fetchTribos = async () => {
    try {
      const response = await axios.get(`${url}/tribes`);
      setTribos(response.data);
    } catch (err) {
      setError("Erro ao carregar tribos");
    }
  };

  const handleEdit = (tribo) => {
    setEditingTribo({ ...tribo });
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditingTribo(null);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");

      // Validar campos obrigatórios
      if (!editingTribo.nometribos?.trim()) {
        setError("Nome da tribo é obrigatório");
        return;
      }

      const response = await axios.put(`${url}/tribes/update`, {
        idtribos: editingTribo.idtribos,
        nometribos: editingTribo.nometribos.trim(),
        nomelider: editingTribo.nomelider?.trim(),
        norevicelider: editingTribo.norevicelider?.trim(),
        nomesecretario: editingTribo.nomesecretario?.trim(),
      });

      if (response.data.success) {
        setSuccess("Tribo atualizada com sucesso!");
        fetchTribos(); // Recarregar a lista de tribos
        setEditingTribo(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar tribo");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingTribo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container">
      <h1>Gerenciar Tribos</h1>
      <p className="dev-warning">Área do Desenvolvedor - Altere com cuidado</p>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="tribos-list">
        {tribos.map((tribo) => (
          <div key={tribo.idtribos} className="tribo-item">
            {editingTribo?.idtribos === tribo.idtribos ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Nome da Tribo:</label>
                  <input
                    type="text"
                    name="nometribos"
                    value={editingTribo.nometribos}
                    onChange={handleChange}
                    placeholder="Nome da Tribo"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Líder:</label>
                  <input
                    type="text"
                    name="nomelider"
                    value={editingTribo.nomelider}
                    onChange={handleChange}
                    placeholder="Nome do Líder"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Vice-líder:</label>
                  <input
                    type="text"
                    name="norevicelider"
                    value={editingTribo.norevicelider}
                    onChange={handleChange}
                    placeholder="Nome do Vice-líder"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Secretário:</label>
                  <input
                    type="text"
                    name="nomesecretario"
                    value={editingTribo.nomesecretario}
                    onChange={handleChange}
                    placeholder="Nome do Secretário"
                    className="form-control"
                  />
                </div>
                <div className="form-buttons">
                  <button onClick={handleSave} className="btn-save">Salvar</button>
                  <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="tribo-info">
                <h3>{tribo.nometribos}</h3>
                <p><strong>ID:</strong> {tribo.idtribos}</p>
                <p><strong>Líder:</strong> {tribo.nomelider}</p>
                <p><strong>Vice-líder:</strong> {tribo.norevicelider}</p>
                <p><strong>Secretário:</strong> {tribo.nomesecretario}</p>
                <button onClick={() => handleEdit(tribo)} className="btn-edit">Editar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GerenciarTribos; 