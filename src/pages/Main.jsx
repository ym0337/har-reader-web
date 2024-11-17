import React, { useState } from "react";
import { Layout, Button, message, Menu, theme, Row, Col, Alert } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import UploadTable from "../components/UploadTable";
import ApiTable from "../components/ApiTable";

const { Header, Footer, Sider } = Layout;

const Main = () => {
  const [collapsed, setCollapsed] = useState(false); // 侧边栏状态
  const [selectMenu, setSelectMenu] = useState(""); // 选中菜单项
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const changeMenu = (e) => {
    // console.log(e);
    setSelectMenu(e.key);
  };

  // 页面加载时获取文件列表
  React.useEffect(() => {
    setSelectMenu("文件库");
  }, []);

  return (
    <>
      <Layout>
        <Header
          style={{
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>工作台</div>
          <Button
            type="primary"
            onClick={() => {
              localStorage.removeItem("isAuthenticated");
              message.info("已退出登录");
              window.location.href = "/login";
            }}
          >
            退出登录
          </Button>
        </Header>
      </Layout>
      <Layout>
        <Sider
          style={{ width: 200 }}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["文件库"]}
            onClick={(e) => changeMenu(e)}
            items={[
              {
                key: "文件库",
                icon: <UserOutlined />,
                label: "文件库",
              },
              {
                key: "接口列表",
                icon: <VideoCameraOutlined />,
                label: "接口列表",
              },
            ]}
          />
        </Sider>
        <Row>
          <Col span={24}>
            <Header
              style={{
                background: colorBgContainer,
                paddingLeft: "2px",
                width: collapsed ? "calc(100vw - 98px)" : "calc(100vw - 218px)",
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
            </Header>
          </Col>
          <Col span={24}>
            <div style={{ height: "calc(100vh - 218px)" }}>
              {selectMenu === "文件库" && <UploadTable collapsed={collapsed} />}
              {selectMenu === "接口列表" && <ApiTable collapsed={collapsed} />}
            </div>
          </Col>
          <Col span={24}>
            <Footer style={{ textAlign: "center" }}>
            <Alert message="每次只能解析一个.har文件，重复【执行】会清除保留最新数据" type="error" showIcon />
            </Footer>
          </Col>
        </Row>
      </Layout>
    </>
  );
};

export default Main;
