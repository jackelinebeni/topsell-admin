import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Alert } from 'antd';
import quotePromoService from '../../services/quotePromoService';

const { TextArea } = Input;

const QuotePromo = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await quotePromoService.get();
      form.setFieldsValue(data);
    } catch {
      message.error('Error al cargar la configuración de la promoción');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await quotePromoService.update(values);
      message.success('Sección de promoción actualizada correctamente');
    } catch {
      message.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Promoción del correo de cotización
      </h2>
      <Alert
        style={{ marginBottom: 24 }}
        type="info"
        showIcon
        message="Este texto aparece en el correo que reciben los clientes al enviar una cotización. La estructura y estilos del correo no cambian, solo el contenido."
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={loading}
      >
        <Card title="Promocional" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Título"
            name="promoTitle"
            extra="Se muestra en negrita y color azul, arriba de la sección."
          >
            <TextArea rows={2} placeholder="¡Por lanzamiento de web! Envíos gratis a Lima Metropolitana para pedidos mayores de S/ 200.00." />
          </Form.Item>
          <Form.Item
            label="Texto"
            name="promoText"
            extra="Condiciones de la promoción, en letra pequeña. Admite HTML simple (ej. <br>, <em>)."
          >
            <TextArea rows={3} placeholder="(Válido para compras confirmadas hasta el 15 marzo del 2026). <br><em>*Envíos a provincia por agencia.</em>" />
          </Form.Item>
        </Card>

        <Card title="Información">
          <Form.Item
            label="Subtítulo (negrita)"
            name="infoSubtitle"
            extra="Se muestra en negrita, al inicio del párrafo final."
          >
            <Input placeholder="¿Listo para comprar?" />
          </Form.Item>
          <Form.Item
            label="Texto"
            name="infoText"
            extra="Continúa la misma línea después del subtítulo en negrita."
          >
            <TextArea rows={3} placeholder="Responde este correo confirmando tu solicitud, y un asesor comercial se pondrá en contacto contigo pronto para coordinar el pago y entrega." />
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

export default QuotePromo;
