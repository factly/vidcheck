import Home from "../Modules/Home";

class Route {
    constructor({ path, component, title, onNavigation = false, exact = true }) {
        this.path = path;
        this.component = component;
        this.title = title;
        this.onNavigation = onNavigation;
        this.exact = exact;
        // If urlName is not provided, set the urlName from path.
        // eg: path = '/categories/create' -> urlName = 'categories-create'
        this.urlName = path.replace(/^\//g, '').replace(/\//g, '-').replace(':id', 'detail');
    }
}

const routes = [
    new Route(
        {
            path: '/',
            title: 'Search Factcheck Articles',
            component: Home
        }
    )
];

export default routes;