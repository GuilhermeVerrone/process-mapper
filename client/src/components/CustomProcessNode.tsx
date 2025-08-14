import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

// O tipo dos dados que nosso nó vai receber.
// Esperamos um 'label' (o nome do processo) e uma 'color' opcional.
type NodeData = {
  label: string;
  color?: string;
};

// Usamos `memo` para otimizar o desempenho, evitando que os nós sejam
// re-renderizados desnecessariamente quando outros nós mudam.
const CustomProcessNode = memo(({ data }: NodeProps<NodeData>) => {
  return (
    <>
      {/* Handle são os "pontos de conexão" para as arestas (linhas). */}
      {/* O 'target' é onde as linhas chegam (neste caso, no topo). */}
      <Handle type="target" position={Position.Top} id="a" />

      {/* Este é o corpo do nosso nó customizado. */}
      <div
        style={{
          backgroundColor: data.color || '#f0f0f0', // Usa a cor do processo ou uma cor cinza padrão
          padding: '10px 15px',
          borderRadius: '5px',
          border: '1px solid #222',
          textAlign: 'center',
          minWidth: '150px',
          fontSize: '14px',
          color: '#333'
        }}
      >
        {/* Exibe o nome do processo */}
        {data.label}
      </div>

      {/* O 'source' é de onde as linhas saem (neste caso, da base). */}
      <Handle type="source" position={Position.Bottom} id="b" />
    </>
  );
});

export default CustomProcessNode;