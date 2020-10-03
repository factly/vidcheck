/**
 * Makes a GET request to the specified endpoint.
 *
 * @param {String} url the endpoint
 * @param {Object} params the query parameters
 * @param {boolean} overwriteBaseUrl to overwrite the base url
 */

export function get(url, params = {}, overwriteBaseUrl = false) {
    const endpoint = overwriteBaseUrl
        ? url
        : process.env.REACT_APP_BASE_API_URL + url;
    const urlWithParams = new URL(endpoint, window.location.origin);

    urlWithParams.search = new URLSearchParams(params);

    return fetch(urlWithParams.href, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            throw response;
        }
        return response.json();
    });
}

/**
 * Makes a POST request to the specified endpoint with the body as JSON.
 *
 * @param {String} url the endpoint
 * @param {Object} body the POST body
 * @param {Object} params the query parameters
 * @param {boolean} overwriteBaseUrl to overwrite the base url
 */
export function post(url, body, params = {}, overwriteBaseUrl = false) {
    const endpoint = overwriteBaseUrl
        ? url
        : process.env.REACT_APP_BASE_API_URL + url;
    const urlWithParams = new URL(endpoint, window.location.origin);

    urlWithParams.search = new URLSearchParams(params);

    return fetch(urlWithParams.href, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json());
}

/**
 * Makes a PUT request to the specified endpoint with the body as JSON.
 *
 * @param {String} url the endpoint
 * @param {Object} body the POST body
 * @param {Object} params the query parameters
 * @param {boolean} overwriteBaseUrl to overwrite the base url
 */
export function put(url, body, params = {}, overwriteBaseUrl = false) {
    const endpoint = overwriteBaseUrl
        ? url
        : process.env.REACT_APP_BASE_API_URL + url;
    const urlWithParams = new URL(endpoint, window.location.origin);

    urlWithParams.search = new URLSearchParams(params);

    return fetch(urlWithParams.href, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json());
}

/**
 * Makes a DELETE request to the specified endpoint.
 *
 * @param {String} url the endpoint
 * @param {Object} params the query parameters
 * @param {boolean} overwriteBaseUrl to overwrite the base url
 */

export function deleteAPI(url, params = {}, overwriteBaseUrl = false) {
    const endpoint = overwriteBaseUrl
        ? url
        : process.env.REACT_APP_BASE_API_URL + url;
    const urlWithParams = new URL(endpoint, window.location.origin);

    urlWithParams.search = new URLSearchParams(params);

    return fetch(urlWithParams.href, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json());
}
