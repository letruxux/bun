import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import Bun from "bun";

const app = new Hono();

app.use("/*", serveStatic({ root: "./dist" }));

app.get("*", async (c) => {
  return c.html(await Bun.file("./dist/index.html").text());
});

export default app;
