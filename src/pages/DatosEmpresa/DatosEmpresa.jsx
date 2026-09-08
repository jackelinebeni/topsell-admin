import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Row, Col } from 'antd';
import companyInfoService from '../../services/companyInfoService';

const DatosEmpresa = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await companyInfoService.get();
      form.setFieldsValue(data);
    } catch {
      message.error('Error al cargar los datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await companyInfoService.update(values);
      message.success('Datos de la empresa actualizados correctamente');
    } catch {
      message.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Datos de Empresa
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={loading}
      >
        <Card title="Horarios de atención" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Horario de semana" name="weekdaysSchedule">
                <Input placeholder="Lunes - Viernes: 9:00AM - 6:00PM" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Horario de sábado" name="saturdaySchedule">
                <Input placeholder="Sábado: 9:00AM - 2:00PM" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Contacto" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Correo de contacto" name="email">
                <Input placeholder="info@topsell.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Número de WhatsApp"
                name="whatsappNumber"
                extra="Código de país + número, solo dígitos, sin '+' ni espacios. Ej: 51933636607"
              >
                <Input placeholder="51933636607" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Redes sociales">
          <Form.Item label="Facebook" name="facebookUrl">
            <Input placeholder="https://www.facebook.com/tu-pagina" />
          </Form.Item>
          <Form.Item label="Instagram" name="instagramUrl">
            <Input placeholder="https://www.instagram.com/tu-cuenta" />
          </Form.Item>
          <Form.Item label="TikTok" name="tiktokUrl">
            <Input placeholder="https://www.tiktok.com/@tu-cuenta" />
          </Form.Item>
        </Card>

        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={saving} size="large">
            Guardar cambios
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DatosEmpresa;
