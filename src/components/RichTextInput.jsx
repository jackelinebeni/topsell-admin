import { useRef, useEffect } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { BoldOutlined, UnorderedListOutlined } from '@ant-design/icons';

/**
 * Editor de texto enriquecido simple: negrita y viñetas, sin control de fuente.
 * @param {string} value - Contenido HTML actual
 * @param {function} onChange - Callback con el nuevo HTML
 * @param {string} placeholder
 * @param {number} minHeight
 */
const RichTextInput = ({ value, onChange, placeholder = 'Escribe aquí...', minHeight = 100 }) => {
  const editorRef = useRef(null);

  // Sincronizar el HTML externo solo cuando cambia fuera del propio editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command) => {
    editorRef.current?.focus();
    document.execCommand(command);
    onChange?.(editorRef.current?.innerHTML || '');
  };

  const handleInput = (e) => {
    onChange?.(e.currentTarget.innerHTML);
  };

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
      <Space style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
        <Tooltip title="Negrita">
          <Button
            size="small"
            icon={<BoldOutlined />}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('bold')}
          />
        </Tooltip>
        <Tooltip title="Viñetas">
          <Button
            size="small"
            icon={<UnorderedListOutlined />}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('insertUnorderedList')}
          />
        </Tooltip>
      </Space>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        className="rich-text-editable"
        style={{
          minHeight,
          padding: '8px 11px',
          outline: 'none',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      />
      <style>{`
        .rich-text-editable:empty:before {
          content: attr(data-placeholder);
          color: #bfbfbf;
        }
        .rich-text-editable ul {
          margin: 0;
          padding-left: 24px;
        }
      `}</style>
    </div>
  );
};

export default RichTextInput;
