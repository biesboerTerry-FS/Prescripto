import app from "../app.js";

// Vercel Node function entry point. Express apps are request listeners, so the
// app can be invoked directly without the extra serverless-http wrapper.
export default function handler(request, response) {
  return app(request, response);
}
