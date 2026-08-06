import { initBotId } from "botid/client/core";

// Server Actions POST to the page that invokes them, so the protected path is the route
// itself, not an API endpoint. Without this, `checkBotId()` on the server always fails.
initBotId({
  protect: [
    { path: "/", method: "POST" },
    { path: "/v2", method: "POST" },
  ],
});
