import Videos from "../pages/videos";

//Categories
import Categories from '../pages/categories';
import CreateCategory from '../pages/categories/CreateCategory';
import EditCategory from '../pages/categories/EditCategory';

//Ratings
import Ratings from "../pages/ratings";
import CreateRating from "../pages/ratings/CreateRating";
import EditRating from "../pages/ratings/EditRating";

//Claimants
import Claimants from "../pages/claimants";
import CreateClaimant from "../pages/claimants/CreateClaimant";
import EditClaimant from "../pages/claimants/EditClaimant";

//Spaces
import Spaces from "../pages/spaces";
import CreateSpace from "../pages/spaces/CreateSpace";
import EditSpace from "../pages/spaces/EditSpace";

//Media
import Media from "../pages/media";
import UploadMedium from "../pages/media/UploadMedium";
import EditMedium from "../pages/media/EditMedium";


import Preview from "../pages/preview";

import CreateAnalysis from "../pages/analysis/CreateAnalysis";
import EditAnalysis from "../pages/analysis/EditAnalysis";

//Policies
import Policies from "../pages/policies";
import CreatePolicy from "../pages/policies/CreatePolicy";
import EditPolicy from "../pages/policies/EditPolicy";

// Organisation Permissions
import OrganisationPermissions from "../pages/permissions/organisations";
import CreateOrganisationPermission from "../pages/permissions/organisations/CreateOrganisationPermission";
import EditOrganisationPermission from "../pages/permissions/organisations/EditOrganisationPermission";

// Space Permissions
import SpacePermissions from "../pages/permissions/spaces";
import CreateSpacePermission from "../pages/permissions/spaces/CreateSpacePermission";
import EditSpacePermission from "../pages/permissions/spaces/EditSpacePermission";

// Organisation Requests
import OrganisationRequests from "../pages/requests/organisations";
import CreateOrganisationRequest from "../pages/requests/organisations/CreateOrganisationRequest";

// Space Requests
import SpaceRequests from "../pages/requests/spaces";
import CreateSpaceRequest from "../pages/requests/spaces/CreateSpaceRequest";

//Pages
import Dashboard from "../pages/dashboard";
import Analytics from "../pages/analytics";

//Tags
import Tags from '../pages/tags';
import CreateTag from '../pages/tags/CreateTag';
import EditTag from '../pages/tags/EditTag';

// Users & Permissions
import Users from "../pages/users";
import PermissionList from "../pages/users/PermissionList";

import {
  DashboardOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const routes = {
  dashboard: {
    path: "/dashboard",
    Component: Dashboard,
    title: "Dashboard",
  },
  home: {
    path: "/",
    Component: Dashboard, // component is empty for now
    title: "Home",
  },
  analytics: {
    path: "/analytics",
    Component: Analytics,
    title: "Analytics",
  },
  createVideo: {
    path: "/videos/create",
    Component: CreateAnalysis,
    title: "Analysis",
    permission: {
      resource: "fact-checks",
      action: "create",
    },
  },
  editVideo: {
    path: "/videos/:id/edit",
    Component: EditAnalysis,
    title: "Edit Analysis",
    permission: {
      resource: "fact-checks",
      action: "create",
    },
  },
  videos: {
    path: "/videos",
    Component: Videos,
    title: "Fact-Checks",
    permission: {
      resource: "fact-checks",
      action: "get",
    },
  },
  categories: {
    path: '/categories',
    Component: Categories,
    title: 'Categories',
    permission: {
      resource: 'categories',
      action: 'get',
    },
  },
  createCategory: {
    path: '/categories/create',
    Component: CreateCategory,
    title: 'Create',
    permission: {
      resource: 'categories',
      action: 'create',
    },
  },
  editCategory: {
    path: '/categories/:id/edit',
    Component: EditCategory,
    title: 'Edit',
    permission: {
      resource: 'categories',
      action: 'update',
    },
  },
  ratings: {
    path: "/ratings",
    Component: Ratings,
    title: "Ratings",
    permission: {
      resource: "ratings",
      action: "get",
    },
  },
  createRating: {
    path: "/ratings/create",
    Component: CreateRating,
    title: "Create",
    permission: {
      resource: "ratings",
      action: "create",
    },
  },
  editRating: {
    path: "/ratings/:id/edit",
    Component: EditRating,
    title: "Edit",
    permission: {
      resource: "ratings",
      action: "update",
    },
  },
  claimants: {
    path: "/claimants",
    Component: Claimants,
    title: "Claimants",
    permission: {
      resource: "claimants",
      action: "get",
    },
  },
  createClaimant: {
    path: "/claimants/create",
    Component: CreateClaimant,
    title: "Create",
    permission: {
      resource: "claimants",
      action: "create",
    },
  },
  editClaimant: {
    path: "/claimants/:id/edit",
    Component: EditClaimant,
    title: "Edit",
    permission: {
      resource: "claimants",
      action: "update",
    },
  },
  spaces: {
    path: "/spaces",
    Component: Spaces,
    title: "Spaces",
  },
  createSpace: {
    path: "/spaces/create",
    Component: CreateSpace,
    title: "Create",
    permission: {
      resource: "spaces",
      action: "create",
      isSpace: true,
    },
  },
  editSpace: {
    path: "/spaces/:id/edit",
    Component: EditSpace,
    title: "Edit",
    permission: {
      resource: "spaces",
      action: "update",
    },
  },
  users: {
    path: "/users",
    Component: Users,
    title: "Users",
  },
  usersPermission: {
    path: "/users/:id/permissions",
    Component: PermissionList,
    title: "Users Permission ",
    permission: {
      resource: "users",
      action: "get",
    },
  },
  // {
  //   path: "/videos/create",
  //   Component: CreateVideo,
  //   title: "Create Video",
  // },
  // {
  //   path: "/videos/:id/edit",
  //   Component: EditVideo,
  //   title: "Edit Video",
  // },
  videoPreview: {
    path: "/preview/:id",
    Component: Preview,
    title: "Preview",
    permission: {
      resource: "fact-checks",
      action: "get",
    },
  },
  media: {
    path: "/media",
    Component: Media,
    title: "Media",
    permission: {
      resource: "media",
      action: "get",
    },
  },
  createMedia: {
    path: "/media/upload",
    Component: UploadMedium,
    title: "Upload",
    permission: {
      resource: "media",
      action: "create",
    },
  },
  editMedium: {
    path: "/media/:id/edit",
    Component: EditMedium,
    title: "Edit",
    permission: {
      resource: "media",
      action: "update",
    },
  },
  policies: {
    path: "/policies",
    Component: Policies,
    title: "Policies",
  },
  createPolicy: {
    path: "/policies/create",
    Component: CreatePolicy,
    title: "Create",
    permission: {
      resource: "policies",
      action: "create",
    },
  },
  editPolicy: {
    path: "/policies/:id/edit",
    Component: EditPolicy,
    title: "Edit",
    permission: {
      resource: "policies",
      action: "update",
    },
  },
  organisationPermissions: {
    path: "/permissions/organisations",
    Component: OrganisationPermissions,
    title: "Organisations",
    isAdmin: true,
  },
  createOrganisationPermission: {
    path: "/permissions/organisations/create",
    Component: CreateOrganisationPermission,
    title: "Create",
    isAdmin: true,
  },
  editOrganisationPermission: {
    path: "/organisations/:oid/permissions/:pid/edit",
    Component: EditOrganisationPermission,
    title: "Edit",
    isAdmin: true,
  },
  spacePermissions: {
    path: "/permissions/spaces",
    Component: SpacePermissions,
    title: "Spaces",
    isAdmin: true,
  },
  createSpacePermission: {
    path: "/permissions/spaces/create",
    Component: CreateSpacePermission,
    title: "Create",
    isAdmin: true,
  },
  editSpacePermission: {
    path: "/spaces/:sid/permissions/:pid/edit",
    Component: EditSpacePermission,
    title: "Edit",
    isAdmin: true,
  },
  organisationRequests: {
    path: "/requests/organisations",
    Component: OrganisationRequests,
    title: "Organisations",
    isOwner: true,
  },
  createOrganisationRequest: {
    path: "/requests/organisations/create",
    Component: CreateOrganisationRequest,
    title: "Create",
    isOwner: true,
  },
  spaceRequests: {
    path: "/requests/spaces",
    Component: SpaceRequests,
    title: "Spaces",
    isOwner: true,
  },
  createSpaceRequest: {
    path: "/requests/spaces/create",
    Component: CreateSpaceRequest,
    title: "Create",
    isOwner: true,
  },
  tags: {
    path: '/tags',
    Component: Tags,
    title: 'Tags',
    permission: {
      resource: 'tags',
      action: 'get',
    },
  },
  createTag: {
    path: '/tags/create',
    Component: CreateTag,
    title: 'Create',
    permission: {
      resource: 'tags',
      action: 'create',
    },
  },
  editTag: {
    path: '/tags/:id/edit',
    Component: EditTag,
    title: 'Edit',
    permission: {
      resource: 'tags',
      action: 'update',
    },
  },
};

export const sidebarMenu = [
  {
    title: "DASHBOARD",
    Icon: DashboardOutlined,
    children: [routes.home, routes.analytics],
  },
  {
    title: "FACT CHECKING",
    Icon: CheckCircleOutlined,
    children: [routes.videos, routes.claimants, routes.ratings, routes.categories, routes.tags],
  },
  {
    title: "ADMINSTRATION",
    Icon: IdcardOutlined,
    children: [routes.spaces, routes.policies, routes.users],
    submenu: [
      {
        isAdmin: true,
        title: "Permissions",
        Icon: IdcardOutlined,
        children: [routes.organisationPermissions, routes.spacePermissions],
      },
      {
        title: "Requests",
        Icon: IdcardOutlined,
        children: [routes.organisationRequests, routes.spaceRequests],
      },
    ],
  },
];
export default routes;
