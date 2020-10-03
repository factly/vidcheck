import React, { useEffect, useRef, useState } from "react";
import { defaultTransformer } from "./network.utils";
import { notification } from "antd";
import { useHistory } from "react-router-dom";

function useNetwork(promiseFunction, options = {}) {
    if (!(typeof promiseFunction === "function")) {
        throw new Error("First argument to useNetwork should be a Promise Object");
    }
    let history = useHistory();
    const {
        transformer = defaultTransformer,
        auto = false,
        autoCallArgs = [],
    } = { ...options };

    const [network, setNetworkState] = useState({ state: null, error: null });

    const autoCallConfig = useRef({ auto, autoCallArgs });
    const unmounted = useRef(false);
    const transform = useRef(transformer);
    useEffect(() => {
        transform.current = transformer;
    }, [transformer]);

    const [response, setResponse] = useState(() => transformer(null));

    const call = useRef(async (...args) => {
        try {
            let loadingNetworkMeta = { state: "loading", error: null };
            setNetworkState(loadingNetworkMeta);
            const networkResponse = await promiseFunction(...args);
            const transformed = transform.current(networkResponse, { ...response });
            let successNetworkMeta = { state: "success", error: null };
            setNetworkState(successNetworkMeta);
            if (!unmounted.current) {
                setResponse(transformed);
            }
            return [transformed, successNetworkMeta];
        } catch (error) {
            const networkMeta = { state: "failure", error: error };
            if (!unmounted.current) {
                setNetworkState(networkMeta);
            }
            if (error.status === 401) {
                notification.error({
                    message: "Authentication Failed",
                });
                history.push("/login");
            } else if (error.status === 403) {
                notification.error({
                    message: "Authorization Failed",
                    description: "You don't have permission for the operation",
                });
            } else if (error.status === 500) {
                notification.error({
                    message: "Something went wrong",
                    description: "Something went wrong in the server.",
                });
            } else {
                notification.error({
                    message: "Something went wrong",
                    description: error.details,
                });
            }

            return [error, networkMeta];
        }
    });

    useEffect(() => {
        unmounted.current = false;
        return () => {
            unmounted.current = true;
        };
    }, []);

    useEffect(() => {
        if (autoCallConfig.current.auto) {
            call.current(...autoCallConfig.current.autoCallArgs);
        }
    }, []);

    return {
        response,
        network,
        call: call.current,
    };
}

export { useNetwork };
