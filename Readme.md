# Express with HTTP2 and Server Push and ServiceWorker :rocket:

> Express with HTTP2 Example.
> Server Push Example.
> ServiceWorker Cache.

## Try HTTP2

> Please make sure sure you add nghttp2 in advance libcurl If you'd like to try it on curl

```sh
brew install curl --with-nghttp2
```

---

```sh
docker build -t express-server .
docker run -tid -p 3000:3000 express-server
```

## Try Server Push

Chrome browser: https//localhost:3000/push/ to access.

## Try Server Push and Service Worker Cache.

Chrome browser: https//localhost:3000/ to access.

## Fetch Event Listening. Images file using local cache

Chrome browser: https//localhost:3000/ to next access.
```

