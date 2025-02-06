import React from 'react';
import '../styles/TriboDetalhes.css';

// Função para obter o nome base da tribo (remover números)
const getTriboBase = (nomeTribo) => {
  return nomeTribo.replace(/\d+$/, '').toLowerCase(); // Remove números e converte para minúsculo
};

const TriboDetalhes = ({ tribo }) => {
  const triboBase = getTriboBase(tribo.nometribos);
  const imagePath = `/simbolos/${triboBase}.svg`;
  
  console.log('Tentando carregar imagem:', {
    triboOriginal: tribo.nometribos,
    triboBase: triboBase,
    caminhoImagem: imagePath,
    caminhoCompleto: window.location.origin + imagePath
  });

  return (
    <div className="tribo-detalhes">
      <div className="tribo-header">
        <img 
          src={imagePath} 
          onError={(e) => {
            console.error(`Erro ao carregar imagem: ${imagePath}`);
            e.target.src = "/simbolos/default.svg";
          }}
          alt={`Símbolo da tribo ${tribo.nometribos}`}
          className="tribo-simbolo"
        />
        <h2>{tribo.nometribos}</h2>
      </div>
      
      <div className="tribo-info">
        <p><strong>Líder:</strong> {tribo.nomelider || 'Não definido'}</p>
        <p><strong>Vice-líder:</strong> {tribo.norevicelider || 'Não definido'}</p>
        <p><strong>Secretário:</strong> {tribo.nomesecretario || 'Não definido'}</p>
      </div>
    </div>
  );
};

export default TriboDetalhes; 