import { build, emptyDir } from "dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  importMap: "deno.jsonc",
  outDir: "./npm",
  shims: {
    deno: true,
  },
  compilerOptions: {
    lib: ["DOM", "DOM.Iterable"],
  },
  filterDiagnostic: (diagnostic) => !(diagnostic.file?.fileName.includes("/deno.land/")),
  package: {
    name: "kruh",
    version: Deno.args[0],
    description: "Your package.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/konall/kruh.git",
    },
  },
  postBuild() {
    // Deno.copyFileSync("LICENSE", "npm/LICENSE");
    // Deno.copyFileSync("README.md", "npm/README.md");
  },
});
