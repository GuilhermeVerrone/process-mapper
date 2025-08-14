import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';

type NodeData = {
  label: string;
  color?: string;
  processData: {
    type?: string | null;
  };
};

const CustomProcessNode = memo(({ data }: NodeProps<NodeData>) => {
  const icon = data.processData.type === 'system' 
    ? <ComputerIcon sx={{ fontSize: 16, mr: 0.5 }} /> 
    : <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />;

     console.log("DADOS RECEBIDOS PELO NÓ:", data);
     
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div 
        style={{
          backgroundColor: data.color || '#f0f0f0',
          padding: '10px 15px',
          borderRadius: '5px',
          border: '1px solid #222',
          minWidth: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon} {/* ✅ Renderiza o ícone */}
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

export default CustomProcessNode;