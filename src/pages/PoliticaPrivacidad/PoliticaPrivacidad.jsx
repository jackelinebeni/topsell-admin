import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import legalService from '../../services/legalService';
import RichTextInput from '../../components/RichTextInput';

const FONT_SIZE_OPTIONS = [
  { label: 'Pequeño (14px)', value: 14 },
  { label: 'Normal (16px)', value: 16 },
  { label: 'Mediano (18px)', value: 18 },
  { label: 'Grande (20px)', value: 20 },
  { label: 'Extra grande (24px)', value: 24 },
];
const SLUG = 'politica-privacidad';

const PoliticaPrivacidad = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await legalService.get(SLUG);
      form.setFieldsValue({
        title: data.title || '',
        sections: data.sections?.length ? data.sections : [{ title: '', content: '', contentFontSize: 16 }],
      });
    } catch {
      message.error('Error al cargar los datos de la página');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await legalService.update(SLUG, values);
      message.success('Política de privacidad actualizada correctamente');
    } catch {
      message.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Página — Política de Privacidad
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={loading}
      >
        <Card title="Encabezado" style={{ marginBottom: 24 }}>
          <Form.Item label="Título principal" name="title">
            <Input placeholder="POLÍTICA DE PRIVACIDAD" />
          </Form.Item>
        </Card>

        <Card title="Secciones" style={{ marginBottom: 24 }}>
          <Form.List name="sections">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16, background: '#fafafa' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    }
                    title={`Sección ${name + 1}`}
                  >
                    <Form.Item label="Título" name={[name, 'title']}>
                      <Input placeholder="Ej. 1. Responsable del tratamiento de datos personales" />
                    </Form.Item>
                    <Form.Item label="Contenido" name={[name, 'content']}>
                      <RichTextInput placeholder="Texto de la sección..." minHeight={120} />
                    </Form.Item>
                    <Form.Item label="Tamaño de fuente" name={[name, 'contentFontSize']}>
                      <Select options={FONT_SIZE_OPTIONS} placeholder="Normal (16px)" allowClear />
                    </Form.Item>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ title: '', content: '', contentFontSize: 16 })}
                  icon={<PlusOutlined />}
                  block
                >
                  Agregar sección
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} size="large">
            Guardar cambios
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PoliticaPrivacidad;
