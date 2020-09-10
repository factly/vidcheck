/**
 * Makes a GET request to the specified endpoint.
 *
 * @param {String} url the endpoint
 * @param {Object} params the query parameters
 */

export function get(url, params = {}) {
    const urlWithParams = new URL(url, window.location.origin);
    urlWithParams.search = new URLSearchParams(params);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
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
 */
export function post(url, body, params = {}) {
    const urlWithParams = new URL(url, window.location.origin);
    urlWithParams.search = new URLSearchParams(params);

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json());
}

/**
 * Makes a PUT request to the specified endpoint with the body as JSON.
 *
 * @param {String} url the endpoint
 * @param {Object} body the POST body
 * @param {Object} params the query parameters
 */
export function put(url, body, params = {}) {
    const urlWithParams = new URL(url, window.location.origin);
    urlWithParams.search = new URLSearchParams(params);

    return fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json());
}

/**
 * Makes a DELETE request to the specified endpoint.
 *
 * @param {String} url the endpoint
 * @param {Object} params the query parameters
 */

export function deleteAPI(url, params = {}) {
    const urlWithParams = new URL(url, window.location.origin);
    urlWithParams.search = new URLSearchParams(params);

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json());
}