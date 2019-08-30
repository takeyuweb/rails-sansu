const { environment } = require("@rails/webpacker");
const typescript = require("./loaders/typescript");
const WorkboxPlugin = require("workbox-webpack-plugin");

environment.loaders.prepend("typescript", typescript);

environment.plugins.append(
  "WorkboxPlugin",
  new WorkboxPlugin.GenerateSW({
    swDest: "../service-worker.js",
    clientsClaim: true,
    skipWaiting: true,
    importWorkboxFrom: "local",
    runtimeCaching: [
      {
        urlPattern: "/",
        handler: "NetworkFirst",
        options: {
          cacheName: "page",
          expiration: {
            maxAgeSeconds: 86400
          },
          matchOptions: {
            ignoreSearch: true
          }
        }
      },
      {
        urlPattern: "/?utm_source=homescreen",
        handler: "NetworkFirst",
        options: {
          cacheName: "homescreen",
          expiration: {
            maxAgeSeconds: 60 * 60 * 24
          },
          matchOptions: {
            ignoreSearch: true
          }
        }
      }
    ]
  })
);

module.exports = environment;
