import Videos from "../pages/videos";

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

//Videos
import CreateVideo from "../pages/analysis/CreateVideo";
import EditVideo from "../pages/analysis/EditVideo";

import Preview from "../pages/preview";

const routes = [
  {
    path: "/",
    Component: Videos,
    title: "Videos",
  },
  {
    path: "/ratings",
    Component: Ratings,
    title: "Ratings",
  },
  {
    path: "/ratings/create",
    Component: CreateRating,
    title: "Create Rating",
  },
  {
    path: "/ratings/:id/edit",
    Component: EditRating,
    title: "Edit Rating",
  },
  {
    path: "/claimants",
    Component: Claimants,
    title: "Claimants",
  },
  {
    path: "/claimants/create",
    Component: CreateClaimant,
    title: "Create Claimant",
  },
  {
    path: "/claimants/:id/edit",
    Component: EditClaimant,
    title: "Edit Claimant",
  },
  {
    path: "/spaces",
    Component: Spaces,
    title: "Spaces",
  },
  {
    path: "/spaces/create",
    Component: CreateSpace,
    title: "Create Space",
  },
  {
    path: "/spaces/:id/edit",
    Component: EditSpace,
    title: "Edit Space",
  },
  {
    path: "/videos/create",
    Component: CreateVideo,
    title: "Create Video",
  },
  {
    path: "/videos/:id/edit",
    Component: EditVideo,
    title: "Edit Video",
  },
  {
    path: "/preview/:id",
    Component: Preview,
    title: "Preview",
  },
];

export default routes;
