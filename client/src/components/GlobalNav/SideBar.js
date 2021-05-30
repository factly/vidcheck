import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import { toggleSider } from "../../actions/settings";

import {
  VideoCameraOutlined,
  StarOutlined,
  TeamOutlined,
  AuditOutlined,
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
    { title: "Claimants", path: "/claimants", Icon: TeamOutlined },
    { title: "Space", path: "/spaces", Icon: AuditOutlined },
    { title: "Media", path: "/media", Icon: AuditOutlined },
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
      <Link to="/">
        <div className="menu-header" style={{ backgroundColor: "#eae3e3" }}>
          <img
            alt="logo"
            hidden={!collapsed}
            className="menu-logo"
            src={require("../../assets/vidcheck_logo.png")}
          />
          <img
            alt="logo"
            hidden={collapsed}
            src={require("../../assets/vidcheck.png")}
            style={{ width: "70%" }}
          />
        </div>
      </Link>
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
