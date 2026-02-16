import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Select, message, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import brandService from '../../services/brandService';
import MultipleImageUpload from '../../components/MultipleImageUpload';

const { TextArea } = Input;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      message.error('Error al cargar los productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await brandService.getAll();
      setBrands(data);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
    }
  };

  // --- Helper para búsqueda por texto ---
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
            Reiniciar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
  });

  // --- Handlers (Create, Edit, Delete, Submit, etc.) se mantienen igual ---
  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    
    // Combinar imagen principal con imágenes secundarias
    const allImages = [];
    if (record.imageUrl) {
      allImages.push(record.imageUrl);
    }
    if (record.images && record.images.length > 0) {
      allImages.push(...record.images.map(img => img.imageUrl));
    }
    
    // Cargar subcategorías de la categoría del producto
    if (record.category?.id) {
      const category = categories.find(c => c.id === record.category.id);
      if (category?.subCategories) {
        setSubCategories(category.subCategories);
      }
    }
    
    // Manejar subCategoryId
    let subCategoryId = null;
    if (record.subCategory) {
      subCategoryId = typeof record.subCategory === 'object' 
        ? record.subCategory.id 
        : record.subCategory;
    }
    
    const formData = {
      ...record,
      categoryId: record.category?.id,
      subCategoryId: subCategoryId,
      brandId: record.brand?.id,
      imageUrl: allImages,
      features: record.features || [],
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este producto?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await productService.delete(id);
          message.success('Producto eliminado exitosamente');
          fetchProducts();
        } catch (error) {
          message.error('Error al eliminar el producto');
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
    if (name && !editingProduct) {
      const slug = generateSlug(name);
      form.setFieldsValue({ slug });
    }
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.subCategories && category.subCategories.length > 0) {
      setSubCategories(category.subCategories);
    } else {
      setSubCategories([]);
    }
    form.setFieldsValue({ subCategoryId: undefined });
  };

  const handleSubmit = async (values) => {
    try {
      const images = Array.isArray(values.imageUrl) ? values.imageUrl : [];
      
      const mainImage = images.length > 0 ? images[0] : null;
      const secondaryImages = images.slice(1).map(url => ({
        imageUrl: url
      }));
      
      const productData = {
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        price: values.price,
        stock: values.stock,
        imageUrl: mainImage,
        images: secondaryImages,
        features: values.features || [],
        featured: values.featured || false,
        active: values.active !== undefined ? values.active : true,
        category: categories.find(c => c.id === values.categoryId),
        subCategory: values.subCategoryId 
          ? subCategories.find(sc => sc.id === values.subCategoryId)
          : null,
        brand: brands.find(b => b.id === values.brandId),
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
        message.success('Producto actualizado exitosamente');
      } else {
        await productService.create(productData);
        message.success('Producto creado exitosamente');
      }
      setModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      message.error('Error al guardar el producto');
      console.error(error);
    }
  };

  // --- Columnas con Filtros ---
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ...getColumnSearchProps('name', 'nombre'),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Imagen',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (url) => (
        url ? (
          <Image
            src={url}
            alt="producto"
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : '-'
      ),
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      sorter: (a, b) => a.price - b.price,
      render: (price) => `$${price?.toFixed(2)}`,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 90,
      ...getColumnSearchProps('sku', 'SKU'),
    },
    {
      title: 'Características',
      dataIndex: 'features',
      key: 'features',
      width: 120,
      render: (features) => features && features.length > 0 ? `${features.length} items` : '-',
    },
    {
      title: 'Categoría',
      dataIndex: ['category', 'name'], // Acceso anidado para visualización
      key: 'category',
      width: 120,
      // Filtro dinámico basado en las categorías cargadas
      filters: categories.map(c => ({ text: c.name, value: c.name })),
      onFilter: (value, record) => record.category?.name === value,
    },
    {
      title: 'Subcategoría',
      dataIndex: 'subCategory',
      key: 'subCategory',
      width: 120,
      render: (subCategory) => {
        if (!subCategory) return '-';
        if (typeof subCategory === 'object' && subCategory.name) {
          return subCategory.name;
        }
        return typeof subCategory === 'number' ? `ID: ${subCategory}` : '-';
      },
    },
    {
      title: 'Marca',
      dataIndex: ['brand', 'name'], // Acceso anidado
      key: 'brand',
      width: 120,
      // Filtro dinámico basado en las marcas cargadas
      filters: brands.map(b => ({ text: b.name, value: b.name })),
      onFilter: (value, record) => record.brand?.name === value,
    },
    {
      title: 'Destacado',
      dataIndex: 'featured',
      key: 'featured',
      width: 100,
      filters: [
        { text: 'Sí', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.featured === value,
      render: (featured) => (
        <span style={{ color: featured ? 'green' : 'gray', fontWeight: featured ? 'bold' : 'normal' }}>
          {featured ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      title: 'Activo',
      dataIndex: 'active',
      key: 'active',
      width: 80,
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active) => (
        <span style={{ color: active ? 'green' : 'red' }}>
          {active ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: 'right',
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
        <h2>Gestión de Productos</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nuevo Producto
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1400 }}
      />

      <Modal
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ active: true, featured: false, stock: 0, features: [] }}
        >
          <Form.Item
            name="name"
            label="Nombre del Producto"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del producto' }]}
          >
            <Input placeholder="Nombre del producto" onChange={handleNameChange} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Por favor ingrese el slug' }]}
            extra="URL amigable (ej: camiseta-nike-running)"
          >
            <Input placeholder="camiseta-nike-running" />
          </Form.Item>

          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: 'Por favor ingrese el SKU' }]}
          >
            <Input placeholder="SKU del producto" />
          </Form.Item>

          <Form.Item
            name="features"
            label="Características del Producto"
            extra="Escribe y presiona Enter para agregar cada característica"
          >
            <Select
              mode="tags"
              placeholder="Ej: Material resistente, Diseño ergonómico, etc."
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="price"
              label="Precio"
              rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
              style={{ width: 200 }}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                prefix="$"
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stock"
              rules={[{ required: true, message: 'Por favor ingrese el stock' }]}
              style={{ width: 150 }}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="imageUrl"
            label="Imágenes del Producto"
            rules={[
              { required: true, message: 'Por favor suba al menos una imagen del producto' },
            ]}
            extra="La primera imagen será la principal, las demás serán imágenes secundarias (máximo 5)"
          >
            <MultipleImageUpload folder="products" maxCount={5} />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="categoryId"
              label="Categoría"
              rules={[{ required: true, message: 'Por favor seleccione una categoría' }]}
              style={{ width: 250 }}
            >
              <Select 
                placeholder="Seleccionar categoría"
                onChange={handleCategoryChange}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="subCategoryId"
              label="Subcategoría"
              style={{ width: 250 }}
            >
              <Select 
                placeholder="Seleccionar subcategoría"
                disabled={subCategories.length === 0}
              >
                {subCategories.map((subCat) => (
                  <Select.Option key={subCat.id} value={subCat.id}>
                    {subCat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="brandId"
            label="Marca"
            rules={[{ required: true, message: 'Por favor seleccione una marca' }]}
            style={{ width: '100%' }}
          >
            <Select placeholder="Seleccionar marca">
              {brands.map((brand) => (
                <Select.Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space size="large">
            <Form.Item
              name="featured"
              label="Producto Destacado"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="active"
              label="Activo"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;