import { useState, useRef, useEffect } from 'react';

export default function useNetwork(promiseFunction, options = {}) {
    if (!(typeof promiseFunction === 'function')) {
        throw new Error('First argument to useNetwork should be a Promise Object');
    }
    const { auto = false, autoCallArgs = [] } = { ...options };

    const [network, setNetworkState] = useState({ state: null, error: null });
    const [response, setResponse] = useState(null);

    const autoCallConfig = useRef({ auto, autoCallArgs });
    const unmounted = useRef(false);

    const call = useRef(async (...args) => {
        try {
            let loadingNetworkMeta = { state: 'loading', error: null };
            setNetworkState(loadingNetworkMeta);
            const networkResponse = await promiseFunction(...args);
            let successNetworkMeta = { state: 'success', error: null };
            setNetworkState(successNetworkMeta);
            if (!unmounted.current) {
                setResponse(networkResponse);
            }
            return [networkResponse, successNetworkMeta];
        } catch (error) {
            const networkMeta = { state: 'failed', error: error };
            if (!unmounted.current) {
                setNetworkState(networkMeta);
            }
            alert('error ');
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