// @bun
// server.ts
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      if (req.method === "POST" && url.pathname === "/api/checkout") {
        try {
          const payload = await req.json();
          console.log("Processing order:", payload);
          return Response.json({ status: "success", orderId: `ORD-${Date.now()}` }, { headers: corsHeaders });
        } catch (error) {
          return Response.json({ error: "Checkout failed" }, { status: 500, headers: corsHeaders });
        }
      }
      return Response.json({ error: "Not Found" }, { status: 404, headers: corsHeaders });
    }
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file("." + filePath);
    if (await file.exists()) {
      return new Response(file);
    }
    if (!filePath.includes(".")) {
      return new Response(Bun.file("./index.html"));
    }
    return new Response("Not Found", { status: 404 });
  }
});
console.log(`Lean Native Bun Server running on port 3000`);
