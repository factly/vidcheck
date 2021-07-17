import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import { sidebarMenu } from "../../config/routesConfig";
import { setCollapse } from "./../../actions/sidebar";

const { Sider } = Layout;
const { SubMenu } = Menu;

function Sidebar({ superOrg, permission, orgs, loading }) {
  const { collapsed } = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();

  const { navTheme } = useSelector((state) => state.settings);

  const onCollapse = (collapsed) => {
    collapsed ? dispatch(setCollapse(true)) : dispatch(setCollapse(false));
  };
  if (loading) {
    return null;
  }

  let resource = [
    "home",
    "dashboard",
    "analytics",
    "policies",
    "users",
    "spaces",
    "organisations",
  ];

  let protectedResouces = [
    "media",
    "categories",
    "claimants",
    "ratings",
    "fact-checks",
    "tags",
  ];

  permission.forEach((each) => {
    if (each.resource === "admin" || orgs[0]?.permission.role === "owner") {
      resource = resource.concat(protectedResouces);
    } else {
      if (protectedResouces.includes(each.resource))
        resource.push(each.resource);
    }
  });

  const getMenuItems = (children, index, title) =>
    children.map((route, childIndex) => {
      return resource.includes(route.title.toLowerCase()) ? (
        <Menu.Item key={`${title}.${route.title}.${index}.${childIndex}`}>
          <Link to={route.path}>
            <span>{route.title}</span>
          </Link>
        </Menu.Item>
      ) : null;
    });

  return (
    <Sider
      breakpoint="lg"
      width="256"
      theme={navTheme}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        position: "sticky",
        left: 0,
        top: 0,
        overflow: "auto",
        height: "100vh",
      }}
    >
      <Link to="/">
        <div className="menu-header" style={{ backgroundColor: "#ebebeb" }}>
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
            style={{ width: "100%" }}
          />
        </div>
      </Link>
      <Menu
        theme={navTheme}
        mode="inline"
        className="slider-menu"
        defaultOpenKeys={["0", "1"]}
        defaultSelectedKeys={["DASHBOARD.Home.0.0"]}
      >
        {sidebarMenu.map((menu, index) => {
          const { Icon } = menu;
          return menu.title === "FACT CHECKING" && false ? null : (
            <SubMenu key={index} title={menu.title} icon={<Icon />}>
              {menu.submenu && menu.submenu.length > 0 ? (
                <>
                  {menu.submenu[0].isAdmin === superOrg.is_admin &&
                  orgs[0]?.permission.role === "owner" ? (
                    <SubMenu
                      key={menu.submenu[0].title + index}
                      title={menu.submenu[0].title}
                    >
                      {getMenuItems(
                        menu.submenu[0].children,
                        index,
                        menu.submenu[0].title
                      )}
                    </SubMenu>
                  ) : null}
                  {orgs[0]?.permission.role === "owner" ? (
                    <SubMenu
                      key={menu.submenu[1].title + index}
                      title={menu.submenu[1].title}
                    >
                      {getMenuItems(
                        menu.submenu[1].children,
                        index,
                        menu.submenu[1].title
                      )}
                    </SubMenu>
                  ) : null}
                </>
              ) : null}
              {getMenuItems(menu.children, index, menu.title)}
            </SubMenu>
          );
        })}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
