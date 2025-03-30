// Modern Netlify Function wrapper for day-start-time API
import { Context } from "@netlify/functions";
// Fix: Use absolute path reference for reliable imports
import originalHandler from "../../../netlify/api/day-start-time.js";

// Express adapter to convert Request/Response objects
const expressToNetlify = async (req, context) => {
  // Mock Express-like objects
  const mockReq = {
    method: req.method,
    url: req.url,
    path: new URL(req.url).pathname,
    query: Object.fromEntries(new URL(req.url).searchParams),
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.json() : undefined,
    params: context.params || {}
  };
  
  let statusCode = 200;
  let responseBody = {};
  let responseHeaders = {};
  
  // Mock Express response
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (body) => {
      responseBody = body;
      responseHeaders['Content-Type'] = 'application/json';
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
    end: () => {}
  };
  
  // Call the original Express handler
  await originalHandler(mockReq, mockRes);
  
  // Convert to Netlify Response
  return new Response(
    typeof responseBody === 'object' ? JSON.stringify(responseBody) : responseBody,
    {
      status: statusCode,
      headers: responseHeaders
    }
  );
};

// Modern Netlify Function handler
export default async (req, context) => {
  return expressToNetlify(req, context);
};

// Configure routing
export const config = {
  path: "/api/day-start-time"
};
