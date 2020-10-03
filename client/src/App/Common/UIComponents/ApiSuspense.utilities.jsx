import { API_NETWORK_STATUS } from "../../Constants/app.constants";

const successMeta = { status: API_NETWORK_STATUS.SUCCESS };
export function getMeta(meta) {
  console.log(meta);
  if (!meta) return successMeta;
  if (!Array.isArray(meta)) return meta;

  const metaWithFailure = meta.find(
    (item) => item.state === API_NETWORK_STATUS.FAILURE
  );
  if (metaWithFailure) return metaWithFailure;

  const metaWithLoading = meta.find(
    (item) => item.state === API_NETWORK_STATUS.LOADING
  );
  if (metaWithLoading) return metaWithLoading;

  const metaWithInitialState = meta.find((item) => item.state === null);
  if (metaWithInitialState) return metaWithInitialState;

  return successMeta;
}

export default {};
