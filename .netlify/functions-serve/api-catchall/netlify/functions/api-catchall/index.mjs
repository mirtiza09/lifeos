
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/api-catchall/index.js
import { Context } from "@netlify/functions";
var api_catchall_default = async (req, context) => {
  return new Response(JSON.stringify({
    error: "API endpoint not found",
    path: req.url,
    method: req.method
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json"
    }
  });
};
var config = {
  path: "/api/*"
};
export {
  config,
  api_catchall_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvYXBpLWNhdGNoYWxsL2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBDYXRjaC1hbGwgQVBJIGhhbmRsZXIgZm9yIGFueSB1bm1hdGNoZWQgQVBJIHJvdXRlc1xuaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gXCJAbmV0bGlmeS9mdW5jdGlvbnNcIjtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSwgY29udGV4dCkgPT4ge1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHtcbiAgICBlcnJvcjogXCJBUEkgZW5kcG9pbnQgbm90IGZvdW5kXCIsXG4gICAgcGF0aDogcmVxLnVybCxcbiAgICBtZXRob2Q6IHJlcS5tZXRob2RcbiAgfSksIHtcbiAgICBzdGF0dXM6IDQwNCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIHBhdGg6IFwiL2FwaS8qXCJcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQ0EsU0FBUyxlQUFlO0FBRXhCLElBQU8sdUJBQVEsT0FBTyxLQUFLLFlBQVk7QUFDckMsU0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVO0FBQUEsSUFDakMsT0FBTztBQUFBLElBQ1AsTUFBTSxJQUFJO0FBQUEsSUFDVixRQUFRLElBQUk7QUFBQSxFQUNkLENBQUMsR0FBRztBQUFBLElBQ0YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLE1BQ1AsZ0JBQWdCO0FBQUEsSUFDbEI7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUVPLElBQU0sU0FBUztBQUFBLEVBQ3BCLE1BQU07QUFDUjsiLAogICJuYW1lcyI6IFtdCn0K
