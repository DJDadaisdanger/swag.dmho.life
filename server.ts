const PRODUCTS = {
  "1": { id: 1, name: "Brainrot", price: 199, category: "T-Shirts" },
  "2": { id: 2, name: "Couple Goals", price: 299, category: "T-Shirts" },
  "3": { id: 3, name: "Intellactual", price: 249, category: "T-Shirts" },
  "4": { id: 4, name: "Mug", price: 149, category: "Mugs" },
  "5": { id: 5, name: "Nerdy", price: 229, category: "T-Shirts" },
  "6": { id: 6, name: "Robo", price: 279, category: "T-Shirts" },
  "7": { id: 7, name: "T Sherting", price: 199, category: "T-Shirts" },
  "8": { id: 8, name: "Cute Cover", price: 399, category: "Phone Covers" },
  "9": { id: 9, name: "Pair A Cover", price: 459, category: "Phone Covers" },
  "10": { id: 10, name: "Totem Cover", price: 429, category: "Phone Covers" },
  "11": { id: 11, name: "Cute iPad Cover", price: 599, category: "iPad Covers" },
  "12": { id: 12, name: "Pair A iPad Cover", price: 659, category: "iPad Covers" },
  "13": { id: 13, name: "Totem iPad Cover", price: 629, category: "iPad Covers" },
};

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // API routing
    if (url.pathname.startsWith("/api/")) {
      // CORS headers
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      if (req.method === "POST" && url.pathname === "/api/checkout") {
        try {
          const payload = await req.json(); // Native JSON parsing
          console.log("Processing order:", payload);
          // Process payload against in-memory PRODUCTS object here
          
          return Response.json(
            { status: "success", orderId: `ORD-${Date.now()}` },
            { headers: corsHeaders }
          );
        } catch (error) {
          return Response.json(
            { error: "Checkout failed" },
            { status: 500, headers: corsHeaders }
          );
        }
      }

      return Response.json(
        { error: "Not Found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Static file routing natively
    let filePath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const file = Bun.file("." + filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    // SPA Fallback or 404
    if (!filePath.includes(".")) {
      return new Response(Bun.file("./index.html"));
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Lean Native Bun Server running on port 3000`);
