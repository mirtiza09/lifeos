// Catch-all API handler for any unmatched API routes
import { Context } from "@netlify/functions";

export default async (req, context) => {
  return new Response(JSON.stringify({
    error: "API endpoint not found",
    path: req.url,
    method: req.method
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const config = {
  path: "/api/*"
};
