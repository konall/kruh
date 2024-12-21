import { build } from "esbuild";
import { denoPlugins } from "esbuild-deno-loader";

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname.endsWith(".ts") || url.pathname.endsWith(".js")) {
    const src = (await build({
      plugins: [...denoPlugins()],
      entryPoints: [`./${url.pathname.slice(1)}`],
      write: false,
      format: "esm",
    })).outputFiles?.[0]?.text;

    return new Response(src, {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  return new Response(
    `
      <html>
        <head>
          <script type="module" src="./tests/web/${Deno.args[0]}.test.ts"></script>
        </head>
        <body>
          <select id="select"></select>
          <div id="calendar"></div>
        </body>
      </html>
    `,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
});
