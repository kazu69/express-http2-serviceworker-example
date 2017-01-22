(global => {
    'use strict';

    const CACHE_NAME = 'v1';
    const CACHE = [
        '/images/Octocat.png',
        '/images/Octocat2.png',
        '/images/Octocat3.png',
        '/images/Octocat4.png',
        '/images/Octocat5.png'
    ];

    global.addEventListener('install', event => {
        event.waitUntil(
            caches.open(CACHE_NAME)
            .then(cache => {
                const cachePromises = CACHE.map(url => {
                    const fetchUrl = new URL(url, location.href);
                    const request = new Request(fetchUrl, { mode: 'no-cors' });

                    return fetch(request, {credentials: 'include'}).then(response => {
                        if (response.status >= 400) {
                            throw new Error('request for ' + fetchUrl + ' failed with status ' + response.statusText);
                        }
                        return cache.put(fetchUrl, response);
                    }).catch(error => {
                        console.error('Not caching ' + url + ' due to ' + error);
                    });
                });

                return Promise.all(cachePromises)

            }).catch(error => {
                console.error('Pre-fetching failed:', error);
            })
        );
        event.waitUntil(global.skipWaiting());
    });

    global.addEventListener('activate', event => {
        event.waitUntil(global.clients.claim());
    });

    global.addEventListener('fetch', event => {
        event.respondWith(
            caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                        return response;
                   }
                );
            })
        );
    });
})(self);
