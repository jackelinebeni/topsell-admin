import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Card } from 'antd';
import contactoPageService from '../../services/contactoPageService';
import ImageUpload from '../../components/ImageUpload';
import RichTextInput from '../../components/RichTextInput';

const FONT_SIZE_OPTIONS = [
  { label: 'Pequeño (14px)', value: 14 },
  { label: 'Normal (16px)', value: 16 },
  { label: 'Mediano (18px)', value: 18 },
  { label: 'Grande (20px)', value: 20 },
  { label: 'Extra grande (24px)', value: 24 },
];

const ContactoPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await contactoPageService.get();
      form.setFieldsValue(data);
    } catch {
      message.error('Error al cargar los datos de la página');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await contactoPageService.update(values);
      message.success('Página "Contacto" actualizada correctamente');
    } catch {
      message.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Página — Contacto
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={loading}
      >
        <Card title="Contenido de la página" style={{ marginBottom: 24 }}>
          <Form.Item label="Imagen de portada" name="image">
            <ImageUpload folder="pages/contacto" />
          </Form.Item>
          <Form.Item label="Título principal" name="title">
            <Input placeholder="Hablemos" />
          </Form.Item>
          <Form.Item label="Párrafo introductorio" name="paragraph">
            <RichTextInput placeholder="Déjanos saber tu consulta y te brindaremos una respuesta a la brevedad." />
          </Form.Item>
          <Form.Item label="Tamaño de fuente del párrafo" name="paragraphFontSize">
            <Select options={FONT_SIZE_OPTIONS} placeholder="Normal (16px)" allowClear />
          </Form.Item>
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

export default ContactoPage;
