import Dashboard from "../Modules/Dashboard";
import CreateUpdateVideoAnalysis from "../Modules/CreateUpdateVideoAnalysis";

class Route {
  constructor({ path, component, title, onNavigation = false, exact = true }) {
    this.path = path;
    this.component = component;
    this.title = title;
    this.onNavigation = onNavigation;
    this.exact = exact;
    // If urlName is not provided, set the urlName from path.
    // eg: path = '/categories/create' -> urlName = 'categories-create'
    this.urlName = path
      .replace(/^\//g, "")
      .replace(/\//g, "-")
      .replace(":id", "detail");
  }
}

const routes = [
  new Route({
    path: "/",
    title: "DashBoard",
    component: Dashboard,
  }),
  new Route({
    path: "/create",
    title: "Create",
    component: CreateUpdateVideoAnalysis,
  }),
  new Route({
    path: "/edit/:id",
    title: "Edit",
    component: CreateUpdateVideoAnalysis,
  }),
];

export default routes;
