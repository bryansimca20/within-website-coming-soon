import { initBotId } from "botid/client/core";

// Server Actions POST to the page that invokes them, so the protected path is the route
// itself, not an API endpoint. Without this, `checkBotId()` on the server always fails.
initBotId({
  protect: [
    { path: "/", method: "POST" },
    { path: "/sample", method: "POST" },
    { path: "/sample/feedback", method: "POST" },
    // Biteship bills every area search and quote, so scripts must not reach these.
    { path: "/api/sample/areas", method: "GET" },
    { path: "/api/sample/rates", method: "POST" },
  ],
});
