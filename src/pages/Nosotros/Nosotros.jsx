import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import nosotrosService from '../../services/nosotrosService';
import ImageUpload from '../../components/ImageUpload';
import RichTextInput from '../../components/RichTextInput';

const FONT_SIZE_OPTIONS = [
  { label: 'Pequeño (14px)', value: 14 },
  { label: 'Normal (16px)', value: 16 },
  { label: 'Mediano (18px)', value: 18 },
  { label: 'Grande (20px)', value: 20 },
  { label: 'Extra grande (24px)', value: 24 },
];

const ICON_OPTIONS = [
  { label: 'Cubos (FaCubes)', value: 'FaCubes' },
  { label: 'Gema (FaGem)', value: 'FaGem' },
  { label: 'Escudo (FaShieldAlt)', value: 'FaShieldAlt' },
  { label: 'Apretón de manos (FaHandshake)', value: 'FaHandshake' },
  { label: 'Lupa (FaSearch)', value: 'FaSearch' },
  { label: 'Caballo de ajedrez (FaChessKnight)', value: 'FaChessKnight' },
  { label: 'Cohete (FaRocket)', value: 'FaRocket' },
  { label: 'Estrella (FaStar)', value: 'FaStar' },
  { label: 'Corazón (FaHeart)', value: 'FaHeart' },
  { label: 'Hoja (FaLeaf)', value: 'FaLeaf' },
  { label: 'Globo (FaGlobe)', value: 'FaGlobe' },
  { label: 'Rayo (FaBolt)', value: 'FaBolt' },
];

const Nosotros = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await nosotrosService.get();
      form.setFieldsValue({
        ...data,
        values: data.values?.length ? data.values : [
          { icon: 'FaCubes', title: '', paragraph: '', paragraphFontSize: 16 },
          { icon: 'FaGem', title: '', paragraph: '', paragraphFontSize: 16 },
          { icon: 'FaHandshake', title: '', paragraph: '', paragraphFontSize: 16 },
          { icon: 'FaSearch', title: '', paragraph: '', paragraphFontSize: 16 },
        ],
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
      await nosotrosService.update(values);
      message.success('Página "Nosotros" actualizada correctamente');
    } catch {
      message.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Página — Nosotros
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={loading}
      >
        {/* ===== SECCIÓN: ¿Quiénes somos? ===== */}
        <Card title="¿Quiénes somos?" style={{ marginBottom: 24 }}>
          <Form.Item label="Imagen" name="heroImage">
            <ImageUpload folder="pages/nosotros" />
          </Form.Item>
          <Form.Item label="Título" name="heroTitle">
            <Input placeholder="¿Quiénes somos?" />
          </Form.Item>
          <Form.Item label="Párrafo" name="heroParagraph">
            <RichTextInput placeholder="Descripción de la empresa..." />
          </Form.Item>
          <Form.Item label="Tamaño de fuente del párrafo" name="heroParagraphFontSize">
            <Select options={FONT_SIZE_OPTIONS} placeholder="Normal (16px)" allowClear />
          </Form.Item>
        </Card>

        {/* ===== SECCIÓN: Visión ===== */}
        <Card title="Visión" style={{ marginBottom: 24 }}>
          <Form.Item label="Imagen" name="visionImage">
            <ImageUpload folder="pages/nosotros" />
          </Form.Item>
          <Form.Item label="Título" name="visionTitle">
            <Input placeholder="Visión" />
          </Form.Item>
          <Form.Item label="Párrafo" name="visionParagraph">
            <RichTextInput placeholder="Descripción de la visión..." />
          </Form.Item>
          <Form.Item label="Tamaño de fuente del párrafo" name="visionParagraphFontSize">
            <Select options={FONT_SIZE_OPTIONS} placeholder="Normal (16px)" allowClear />
          </Form.Item>
        </Card>

        {/* ===== SECCIÓN: Misión ===== */}
        <Card title="Misión" style={{ marginBottom: 24 }}>
          <Form.Item label="Imagen" name="missionImage">
            <ImageUpload folder="pages/nosotros" />
          </Form.Item>
          <Form.Item label="Título" name="missionTitle">
            <Input placeholder="Misión" />
          </Form.Item>
          <Form.Item label="Párrafo" name="missionParagraph">
            <RichTextInput placeholder="Descripción de la misión..." />
          </Form.Item>
          <Form.Item label="Tamaño de fuente del párrafo" name="missionParagraphFontSize">
            <Select options={FONT_SIZE_OPTIONS} placeholder="Normal (16px)" allowClear />
          </Form.Item>
        </Card>

        {/* ===== SECCIÓN: Nuestros Valores ===== */}
        <Card title="Nuestros Valores" style={{ marginBottom: 24 }}>
          <Form.Item label="Título de la sección" name="valuesTitle">
            <Input placeholder="Nuestros Valores" />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 14, color: '#888' }}>
            Tarjetas de valores
          </Divider>

          <Form.List name="values">
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
                    title={`Valor ${name + 1}`}
                  >
                    <Form.Item label="Ícono" name={[name, 'icon']}>
                      <Select options={ICON_OPTIONS} placeholder="Selecciona un ícono" />
                    </Form.Item>
                    <Form.Item label="Título" name={[name, 'title']}>
                      <Input placeholder="Nombre del valor" />
                    </Form.Item>
                    <Form.Item label="Descripción" name={[name, 'paragraph']}>
                      <RichTextInput placeholder="Descripción del valor..." minHeight={70} />
                    </Form.Item>
                    <Form.Item label="Tamaño de fuente de la descripción" name={[name, 'paragraphFontSize']}>
                      <Select options={FONT_SIZE_OPTIONS} placeholder="Normal (16px)" allowClear />
                    </Form.Item>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ icon: 'FaCubes', title: '', paragraph: '', paragraphFontSize: 16 })}
                  icon={<PlusOutlined />}
                  block
                >
                  Agregar valor
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

export default Nosotros;
