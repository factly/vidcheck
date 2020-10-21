import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import { toggleSider } from "../../actions/settings";

import {
  VideoCameraOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

function Sidebar() {
  const {
    sider: { collapsed },
    navTheme,
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const resource = [
    { title: "Videos", path: "/", Icon: VideoCameraOutlined },
    { title: "Ratings", path: "/ratings", Icon: StarOutlined },
    { title: "Space", path: "/spaces", Icon: TeamOutlined },
  ];

  return (
    <Sider
      breakpoint="lg"
      width="256"
      theme={navTheme}
      collapsible
      collapsed={collapsed}
      trigger={null}
      onBreakpoint={(broken) => {
        dispatch(toggleSider());
      }}
    >
      <div className="menu-header" style={{ backgroundColor: "#1890ff" }}>
        <img
          alt="logo"
          src={"https://degacms.com/img/dega.svg"}
          style={{ width: "40%" }}
        />
      </div>
      <Menu theme={navTheme} mode="inline" className="slider-menu">
        {resource.map((each) => (
          <Menu.Item key={each.title} icon={<each.Icon />}>
            <Link to={each.path}>
              <span>{each.title}</span>
            </Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
