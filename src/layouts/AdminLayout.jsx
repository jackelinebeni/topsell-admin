import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { 
  DashboardOutlined,
  AppstoreOutlined, 
  TagsOutlined, 
  AppstoreAddOutlined,
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  MailOutlined,
  LogoutOutlined,  TeamOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  GiftOutlined,
  BankOutlined,} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/dashboard" style={{ fontSize: '20px' }}>Dashboard</Link>,
    },
    {
      key: '/banners',
      icon: <AppstoreOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/banners" style={{ fontSize: '20px' }}>Banners</Link>,
    },
    {
      key: '/brands',
      icon: <TagsOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/brands" style={{ fontSize: '20px' }}>Marcas</Link>,
    },
    {
      key: '/categories',
      icon: <AppstoreAddOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/categories" style={{ fontSize: '20px' }}>Categorías</Link>,
    },
    {
      key: '/products',
      icon: <ShoppingOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/products" style={{ fontSize: '20px' }}>Productos</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/users" style={{ fontSize: '20px' }}>Usuarios</Link>,
    },
    {
      key: '/quotes',
      icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/quotes" style={{ fontSize: '20px' }}>Cotizaciones</Link>,
    },
    {
      key: '/quote-promo',
      icon: <GiftOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/quote-promo" style={{ fontSize: '20px' }}>Promoción de correo</Link>,
    },
    {
      key: '/contacts',
      icon: <MailOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/contacts" style={{ fontSize: '20px' }}>Contactos</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'pages-group',
      label: <span style={{ fontSize: '13px', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Páginas del sitio</span>,
      type: 'group',
      children: [
        {
          key: '/nosotros',
          icon: <TeamOutlined style={{ fontSize: '18px' }} />,
          label: <Link to="/nosotros" style={{ fontSize: '20px' }}>Nosotros</Link>,
        },
        {
          key: '/contacto-page',
          icon: <PhoneOutlined style={{ fontSize: '18px' }} />,
          label: <Link to="/contacto-page" style={{ fontSize: '20px' }}>Contacto (página)</Link>,
        },
        {
          key: '/politica-privacidad',
          icon: <SafetyCertificateOutlined style={{ fontSize: '18px' }} />,
          label: <Link to="/politica-privacidad" style={{ fontSize: '20px' }}>Política de Privacidad</Link>,
        },
        {
          key: '/terminos-condiciones',
          icon: <FileProtectOutlined style={{ fontSize: '18px' }} />,
          label: <Link to="/terminos-condiciones" style={{ fontSize: '20px' }}>Términos y Condiciones</Link>,
        },
        {
          key: '/datos-empresa',
          icon: <BankOutlined style={{ fontSize: '18px' }} />,
          label: <Link to="/datos-empresa" style={{ fontSize: '20px' }}>Datos de Empresa</Link>,
        },
      ],
    },
  ];

  const allMenuItems = menuItems.flatMap(item => item.children ?? [item]);
  const selectedKey = allMenuItems.find(item => item.key && location.pathname.startsWith(item.key))?.key || '/dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={280}
        style={{
          background: '#F8F9FA',
        }}
      >
        <div className="logo">
          <img 
            src="/logotipo.png" 
            alt="TopSell Admin" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '60px',
              width: 'auto',
              height: 'auto', 
              objectFit: 'contain'
            }} 
          />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ fontSize: '20px', background: '#F8F9FA', border: 'none' }}
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            background: '#fff', 
            padding: '0 24px', 
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '500' }}>
            Panel de Administración
          </h1>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              <span>{user?.email || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 20px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
