# Express with HTTP2 and Server Push and ServiceWorker :sparkles::rocket::sparkles:

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

When accessing for the first time, Assets file is delivered with Server Push.

Chrome browser: https//localhost:3000/ to access.

After the second time, the Service Worker intercepts the HTTP request and delivers the Assets file from the cache.

Chrome browser: https//localhost:3000/ to next access.

Response too fast ! :sparkles::rocket::sparkles:
