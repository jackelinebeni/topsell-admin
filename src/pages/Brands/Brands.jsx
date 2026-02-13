import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import brandService from '../../services/brandService';
import ImageUpload from '../../components/ImageUpload';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await brandService.getAll();
      setBrands(data);
    } catch (error) {
      message.error('Error al cargar las marcas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBrand(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBrand(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta marca?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await brandService.delete(id);
          message.success('Marca eliminada exitosamente');
          fetchBrands();
        } catch (error) {
          message.error('Error al eliminar la marca');
          console.error(error);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBrand) {
        await brandService.update(editingBrand.id, values);
        message.success('Marca actualizada exitosamente');
      } else {
        await brandService.create(values);
        message.success('Marca creada exitosamente');
      }
      setModalVisible(false);
      form.resetFields();
      fetchBrands();
    } catch (error) {
      message.error('Error al guardar la marca');
      console.error(error);
    }
  };

  // --- Configuración de Columnas ---
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id, // Ordenar por ID numérico
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      // Filtro de búsqueda por texto para el nombre
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar marca"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Limpiar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.name.localeCompare(b.name), // Ordenar alfabéticamente
    },
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      width: 120,
      render: (url) => (
        url ? (
          <Image
            src={url}
            alt="logo"
            width={80}
            height={50}
            style={{ objectFit: 'contain' }}
          />
        ) : '-'
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestión de Marcas</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nueva Marca
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de la marca' }]}
          >
            <Input placeholder="Nombre de la marca" />
          </Form.Item>

          <Form.Item
            name="logoUrl"
            label="Logo de la Marca"
          >
            <ImageUpload folder="brands" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Brands;