
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/habits-id-operations-complete/index.js
import { Context } from "@netlify/functions";

// netlify/api/habits/[id]/operations/complete.js
async function handler(req, res) {
  res.json({ message: "Test" });
}

// netlify/functions/habits-id-operations-complete/index.js
var expressToNetlify = async (req, context) => {
  const mockReq = {
    method: req.method,
    url: req.url,
    path: new URL(req.url).pathname,
    query: Object.fromEntries(new URL(req.url).searchParams),
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.json() : void 0,
    params: context.params || {}
  };
  let statusCode = 200;
  let responseBody = {};
  let responseHeaders = {};
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (body) => {
      responseBody = body;
      responseHeaders["Content-Type"] = "application/json";
      return mockRes;
    },
    send: (body) => {
      responseBody = body;
      return mockRes;
    },
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    set: (name, value) => {
      responseHeaders[name] = value;
      return mockRes;
    },
    end: () => {
    }
  };
  await handler(mockReq, mockRes);
  return new Response(
    typeof responseBody === "object" ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};
var habits_id_operations_complete_default = async (req, context) => {
  return expressToNetlify(req, context);
};
var config = {
  path: "/api/habits/:$1/operations/complete.js"
};
export {
  config,
  habits_id_operations_complete_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvaGFiaXRzLWlkLW9wZXJhdGlvbnMtY29tcGxldGUvaW5kZXguanMiLCAibmV0bGlmeS9hcGkvaGFiaXRzL1tpZF0vb3BlcmF0aW9ucy9jb21wbGV0ZS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb24gd3JhcHBlciBmb3IgbmVzdGVkIEFQSTogaGFiaXRzL1tpZF0vb3BlcmF0aW9ucy9jb21wbGV0ZS5qc1xuaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gXCJAbmV0bGlmeS9mdW5jdGlvbnNcIjtcbi8vIEZpeDogVXNlIGFic29sdXRlIHBhdGggcmVmZXJlbmNlIGZvciByZWxpYWJsZSBpbXBvcnRzXG5pbXBvcnQgb3JpZ2luYWxIYW5kbGVyIGZyb20gXCIuLi8uLi8uLi9uZXRsaWZ5L2FwaS9oYWJpdHMvW2lkXS9vcGVyYXRpb25zL2NvbXBsZXRlLmpzXCI7XG5cbi8vIEV4cHJlc3MgYWRhcHRlciB0byBjb252ZXJ0IFJlcXVlc3QvUmVzcG9uc2Ugb2JqZWN0c1xuY29uc3QgZXhwcmVzc1RvTmV0bGlmeSA9IGFzeW5jIChyZXEsIGNvbnRleHQpID0+IHtcbiAgLy8gTW9jayBFeHByZXNzLWxpa2Ugb2JqZWN0c1xuICBjb25zdCBtb2NrUmVxID0ge1xuICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICB1cmw6IHJlcS51cmwsXG4gICAgcGF0aDogbmV3IFVSTChyZXEudXJsKS5wYXRobmFtZSxcbiAgICBxdWVyeTogT2JqZWN0LmZyb21FbnRyaWVzKG5ldyBVUkwocmVxLnVybCkuc2VhcmNoUGFyYW1zKSxcbiAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVxLmhlYWRlcnMpLFxuICAgIGJvZHk6IHJlcS5ib2R5ID8gYXdhaXQgcmVxLmpzb24oKSA6IHVuZGVmaW5lZCxcbiAgICBwYXJhbXM6IGNvbnRleHQucGFyYW1zIHx8IHt9XG4gIH07XG4gIFxuICBsZXQgc3RhdHVzQ29kZSA9IDIwMDtcbiAgbGV0IHJlc3BvbnNlQm9keSA9IHt9O1xuICBsZXQgcmVzcG9uc2VIZWFkZXJzID0ge307XG4gIFxuICAvLyBNb2NrIEV4cHJlc3MgcmVzcG9uc2VcbiAgY29uc3QgbW9ja1JlcyA9IHtcbiAgICBzdGF0dXM6IChjb2RlKSA9PiB7XG4gICAgICBzdGF0dXNDb2RlID0gY29kZTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAganNvbjogKGJvZHkpID0+IHtcbiAgICAgIHJlc3BvbnNlQm9keSA9IGJvZHk7XG4gICAgICByZXNwb25zZUhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBzZW5kOiAoYm9keSkgPT4ge1xuICAgICAgcmVzcG9uc2VCb2R5ID0gYm9keTtcbiAgICAgIHJldHVybiBtb2NrUmVzO1xuICAgIH0sXG4gICAgc2V0SGVhZGVyOiAobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG1vY2tSZXM7XG4gICAgfSxcbiAgICBzZXQ6IChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgcmVzcG9uc2VIZWFkZXJzW25hbWVdID0gdmFsdWU7XG4gICAgICByZXR1cm4gbW9ja1JlcztcbiAgICB9LFxuICAgIGVuZDogKCkgPT4ge31cbiAgfTtcbiAgXG4gIC8vIENhbGwgdGhlIG9yaWdpbmFsIEV4cHJlc3MgaGFuZGxlclxuICBhd2FpdCBvcmlnaW5hbEhhbmRsZXIobW9ja1JlcSwgbW9ja1Jlcyk7XG4gIFxuICAvLyBDb252ZXJ0IHRvIE5ldGxpZnkgUmVzcG9uc2VcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShcbiAgICB0eXBlb2YgcmVzcG9uc2VCb2R5ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlQm9keSkgOiByZXNwb25zZUJvZHksXG4gICAge1xuICAgICAgc3RhdHVzOiBzdGF0dXNDb2RlLFxuICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzXG4gICAgfVxuICApO1xufTtcblxuLy8gTW9kZXJuIE5ldGxpZnkgRnVuY3Rpb24gaGFuZGxlclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSwgY29udGV4dCkgPT4ge1xuICByZXR1cm4gZXhwcmVzc1RvTmV0bGlmeShyZXEsIGNvbnRleHQpO1xufTtcblxuLy8gQ29uZmlndXJlIHJvdXRpbmdcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIHBhdGg6IFwiL2FwaS9oYWJpdHMvOiQxL29wZXJhdGlvbnMvY29tcGxldGUuanNcIlxufTtcbiIsICJleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7IHJlcy5qc29uKHttZXNzYWdlOiBcIlRlc3RcIn0pOyB9XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQ0EsU0FBUyxlQUFlOzs7QUNEeEIsZUFBTyxRQUErQixLQUFLLEtBQUs7QUFBRSxNQUFJLEtBQUssRUFBQyxTQUFTLE9BQU0sQ0FBQztBQUFHOzs7QURNL0UsSUFBTSxtQkFBbUIsT0FBTyxLQUFLLFlBQVk7QUFFL0MsUUFBTSxVQUFVO0FBQUEsSUFDZCxRQUFRLElBQUk7QUFBQSxJQUNaLEtBQUssSUFBSTtBQUFBLElBQ1QsTUFBTSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7QUFBQSxJQUN2QixPQUFPLE9BQU8sWUFBWSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsWUFBWTtBQUFBLElBQ3ZELFNBQVMsT0FBTyxZQUFZLElBQUksT0FBTztBQUFBLElBQ3ZDLE1BQU0sSUFBSSxPQUFPLE1BQU0sSUFBSSxLQUFLLElBQUk7QUFBQSxJQUNwQyxRQUFRLFFBQVEsVUFBVSxDQUFDO0FBQUEsRUFDN0I7QUFFQSxNQUFJLGFBQWE7QUFDakIsTUFBSSxlQUFlLENBQUM7QUFDcEIsTUFBSSxrQkFBa0IsQ0FBQztBQUd2QixRQUFNLFVBQVU7QUFBQSxJQUNkLFFBQVEsQ0FBQyxTQUFTO0FBQ2hCLG1CQUFhO0FBQ2IsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLE1BQU0sQ0FBQyxTQUFTO0FBQ2QscUJBQWU7QUFDZixzQkFBZ0IsY0FBYyxJQUFJO0FBQ2xDLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxNQUFNLENBQUMsU0FBUztBQUNkLHFCQUFlO0FBQ2YsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLFdBQVcsQ0FBQyxNQUFNLFVBQVU7QUFDMUIsc0JBQWdCLElBQUksSUFBSTtBQUN4QixhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsS0FBSyxDQUFDLE1BQU0sVUFBVTtBQUNwQixzQkFBZ0IsSUFBSSxJQUFJO0FBQ3hCLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxLQUFLLE1BQU07QUFBQSxJQUFDO0FBQUEsRUFDZDtBQUdBLFFBQU0sUUFBZ0IsU0FBUyxPQUFPO0FBR3RDLFNBQU8sSUFBSTtBQUFBLElBQ1QsT0FBTyxpQkFBaUIsV0FBVyxLQUFLLFVBQVUsWUFBWSxJQUFJO0FBQUEsSUFDbEU7QUFBQSxNQUNFLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTyx3Q0FBUSxPQUFPLEtBQUssWUFBWTtBQUNyQyxTQUFPLGlCQUFpQixLQUFLLE9BQU87QUFDdEM7QUFHTyxJQUFNLFNBQVM7QUFBQSxFQUNwQixNQUFNO0FBQ1I7IiwKICAibmFtZXMiOiBbXQp9Cg==
