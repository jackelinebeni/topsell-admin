import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Tag, Descriptions, Input } from 'antd';
import { EyeOutlined, DeleteOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import contactService from '../../services/contactService';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (error) {
      message.error('Error al cargar los mensajes de contacto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper para búsqueda en columnas ---
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

  const handleView = (record) => {
    setSelectedContact(record);
    setModalVisible(true);
    if (!record.leido) {
      handleMarkAsRead(record.id);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await contactService.markAsRead(id);
      fetchContacts();
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este mensaje?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await contactService.delete(id);
          message.success('Mensaje eliminado exitosamente');
          fetchContacts();
        } catch (error) {
          message.error('Error al eliminar el mensaje');
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Estado',
      dataIndex: 'leido',
      key: 'leido',
      width: 110,
      filters: [
        { text: 'Leído', value: true },
        { text: 'Nuevo', value: false },
      ],
      onFilter: (value, record) => record.leido === value,
      render: (leido) => (
        <Tag color={leido ? 'green' : 'orange'}>
          {leido ? 'Leído' : 'Nuevo'}
        </Tag>
      ),
    },
    {
      title: 'Nombres',
      dataIndex: 'nombres',
      key: 'nombres',
      width: 150,
      ...getColumnSearchProps('nombres', 'nombres'),
    },
    {
      title: 'Apellidos',
      dataIndex: 'apellidos',
      key: 'apellidos',
      width: 150,
      ...getColumnSearchProps('apellidos', 'apellidos'),
    },
    {
      title: 'Correo',
      dataIndex: 'correo',
      key: 'correo',
      width: 200,
      ...getColumnSearchProps('correo', 'correo'),
    },
    {
      title: 'DNI/RUC',
      dataIndex: 'dniOrRuc',
      key: 'dniOrRuc',
      width: 120,
      ...getColumnSearchProps('dniOrRuc', 'documento'),
    },
    {
      title: 'Razón Social',
      dataIndex: 'razonSocial',
      key: 'razonSocial',
      width: 180,
      ...getColumnSearchProps('razonSocial', 'empresa'),
      render: (text) => text || '-',
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      width: 180,
      sorter: (a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion),
      defaultSortOrder: 'descend', // Mostrar los más recientes primero
      render: (date) => new Date(date).toLocaleString('es-PE'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          >
            Ver
          </Button>
          {!record.leido && (
            <Button
              icon={<CheckOutlined />}
              onClick={() => handleMarkAsRead(record.id)}
              size="small"
            >
              Marcar
            </Button>
          )}
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
        <h2>Mensajes de Contacto</h2>
      </div>

      <Table
        columns={columns}
        dataSource={contacts}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }}
      />

      <Modal
        title="Detalle del Mensaje"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedContact(null);
        }}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="delete"
            danger
            onClick={() => {
              handleDelete(selectedContact.id);
              setModalVisible(false);
            }}
          >
            Eliminar
          </Button>,
        ]}
        width={700}
      >
        {selectedContact && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Estado">
              <Tag color={selectedContact.leido ? 'green' : 'orange'}>
                {selectedContact.leido ? 'Leído' : 'Nuevo'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nombres">{selectedContact.nombres}</Descriptions.Item>
            <Descriptions.Item label="Apellidos">{selectedContact.apellidos}</Descriptions.Item>
            <Descriptions.Item label="Correo Electrónico">{selectedContact.correo}</Descriptions.Item>
            <Descriptions.Item label="DNI/RUC">{selectedContact.dniOrRuc}</Descriptions.Item>
            <Descriptions.Item label="Razón Social">
              {selectedContact.razonSocial || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Envío">
              {new Date(selectedContact.fechaCreacion).toLocaleString('es-PE')}
            </Descriptions.Item>
            <Descriptions.Item label="Mensaje">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.mensaje}</div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Contacts;