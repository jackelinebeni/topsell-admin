import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import categoryService from '../../services/categoryService';
import ImageUpload from '../../components/ImageUpload';

const { TextArea } = Input;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      message.error('Error al cargar las categorías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Funciones auxiliares de búsqueda (Reutilizables) ---
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Buscar ${title}`}
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
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
  });

  // --- Handlers (Create, Edit, Delete, Submit, Slug) se mantienen igual ---
  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    const formData = {
      ...record,
      subCategories: record.subCategories 
        ? record.subCategories.map(sub => sub.name).join(', ') 
        : ''
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta categoría?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await categoryService.delete(id);
          message.success('Categoría eliminada exitosamente');
          fetchCategories();
        } catch (error) {
          message.error('Error al eliminar la categoría');
          console.error(error);
        }
      },
    });
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (name && !editingCategory) {
      const slug = generateSlug(name);
      form.setFieldsValue({ slug });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const subCategoriesArray = values.subCategories 
        ? values.subCategories.split(',').map(s => s.trim()).filter(s => s)
        : [];
      
      const subCategoriesObjects = subCategoriesArray.map(name => ({
        name: name,
        slug: generateSlug(name)
      }));

      const categoryData = {
        ...values,
        subCategories: subCategoriesObjects
      };
      
      if (editingCategory) {
        await categoryService.update(editingCategory.id, categoryData);
        message.success('Categoría actualizada exitosamente');
      } else {
        await categoryService.create(categoryData);
        message.success('Categoría creada exitosamente');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error('Error al guardar la categoría');
      console.error(error);
    }
  };

  // --- Definición de Columnas con Filtros ---
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name', 'nombre'),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      ...getColumnSearchProps('slug', 'slug'),
    },

    {
      title: 'Orden',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      sorter: (a, b) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Imagen',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (url) => (
        url ? (
          <Image
            src={url}
            alt="categoría"
            width={80}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : '-'
      ),
    },
    {
      title: 'Subcategorías',
      dataIndex: 'subCategories',
      key: 'subCategories',
      render: (subCats) => subCats && subCats.length > 0 
        ? subCats.map(sub => sub.name).join(', ') 
        : '-',
      // Filtro simple para saber cuáles tienen subcategorías
      filters: [
        { text: 'Con Subcategorías', value: 'has' },
        { text: 'Sin Subcategorías', value: 'none' },
      ],
      onFilter: (value, record) => 
        value === 'has' ? record.subCategories?.length > 0 : !record.subCategories?.length,
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
        <h2>Gestión de Categorías</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nueva Categoría
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de la categoría' }]}
          >
            <Input placeholder="Nombre de la categoría" onChange={handleNameChange} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Por favor ingrese el slug' }]}
            extra="URL amigable (ej: ropa-deportiva)"
          >
            <Input placeholder="ropa-deportiva" />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="Orden"
            rules={[{ required: true, message: 'Por favor ingrese el orden de la categoría' }]}
          >
            <Input placeholder="Orden de la categoría" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Imagen de la Categoría"
          >
            <ImageUpload folder="categories" />
          </Form.Item>

          <Form.Item
            name="subCategories"
            label="Subcategorías"
            extra="Separadas por comas (ej: Camisetas, Pantalones, Zapatos)"
          >
            <TextArea 
              rows={3}
              placeholder="Camisetas, Pantalones, Zapatos"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;