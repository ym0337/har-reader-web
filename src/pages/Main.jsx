import React, { useState } from "react";
import {
  Layout,
  Button,
  message,
  Menu,
  theme,
  Row,
  Col,
  Tag,
  Switch,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AliwangwangOutlined,
  WechatOutlined,
  SmileOutlined,
  FrownOutlined,
  FireOutlined,
  AlertOutlined,
  CheckOutlined,
  CloseOutlined,
  AndroidOutlined,
  ExclamationOutlined,
} from "@ant-design/icons";
import axiosInstance from "../api/api.js";
import UploadTable from "../components/UploadTable";
import ApiTable from "../components/ApiTable";
import MyApiTable from "../components/MyApiTable";

const { Header, Footer, Sider } = Layout;

const Main = () => {
  const [collapsed, setCollapsed] = useState(false); // 侧边栏状态
  const [selectMenu, setSelectMenu] = useState(""); // 选中菜单项
  const [switchChecked, setSwitchChecked] = useState(false); // 选中菜单项
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const changeMenu = (e) => {
    // console.log(e);
    setSelectMenu(e.key);
  };

  const configInfo = async () => {
    // onNotify 是一个回调函数，通常用于在组件之间传递信息或更新状态
    console.log("configInfo onNotify");
  };

  const changeSwitch = (checked) => {
    // console.log(checked);
    axiosInstance.post("/har/config/allowParameterTransmission", {
      allow: checked,
    }).then((res) => {
      setSwitchChecked(checked);
      message.success(res.message || "配置成功");
    }).catch((err) => {
      console.log(err);
      message.error(err || "配置失败");
    });
  }

  // 页面加载时获取文件列表
  React.useEffect(() => {
    setSelectMenu("文件库");
    // 获取配置，设置是否匹配传参
    axiosInstance.get("/har/config/server").then((res) => {
      // console.log(res.data.config.allow);
      setSwitchChecked(res.data.config.allow);
    }).catch((err) => {
      message.error(err || "获取配置失败");
    });
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
          <div>
            <FrownOutlined /> 工作台 <FireOutlined />
          </div>
          <Button
            type="primary"
            onClick={() => {
              localStorage.removeItem("isAuthenticated");
              message.info("已退出登录");
              window.location.href = "/login";
            }}
          >
            退出 <SmileOutlined />
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
                icon: <AliwangwangOutlined />,
                label: "文件库",
              },
              {
                key: "接口列表",
                icon: <WechatOutlined />,
                label: "接口列表",
              },
              {
                key: "自定义接口",
                icon: <AndroidOutlined />,
                label: "自定义接口",
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
              <Tag
                style={{ fontSize: "16px", lineHeight: "32px" }}
                icon={<AlertOutlined />}
                color="cyan"
              >
                <span>接口是否开启动传参匹配(只支持GET,POST请求且post传参必须是对象)：</span>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  checked={switchChecked}
                  onChange={(checked) => {changeSwitch(checked)}}
                />
              </Tag>
              <Tag
                style={{ fontSize: "12px", lineHeight: "24px" }}
                icon={<ExclamationOutlined />}
                color="red"
              >
                <span>若存在同名接口，自定义接口优先响应</span>
              </Tag>
            </Header>
          </Col>
          <Col span={24}>
            <div style={{ height: "calc(100vh - 129px)" }}>
              {selectMenu === "文件库" && (
                <UploadTable collapsed={collapsed} onNotify={configInfo} />
              )}
              {selectMenu === "接口列表" && <ApiTable collapsed={collapsed} />}
              {selectMenu === "自定义接口" && <MyApiTable collapsed={collapsed} />}
            </div>
          </Col>
          {/* <Col span={24}>
            <Footer style={{ textAlign: "center" }}>
              <Alert
                message="每次只能解析一个.har文件，重复【执行】会清除保留最新数据"
                type="error"
                showIcon
              />
            </Footer>
          </Col> */}
        </Row>
      </Layout>
    </>
  );
};

export default Main;
