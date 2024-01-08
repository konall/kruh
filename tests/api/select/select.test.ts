import { assert } from "test";
import { DOMParser, initParser } from "deno_dom";
import { Select } from "../../../src/select/mod.ts";

Deno.test("basic", async () => {
  await initParser();

  const document = (new DOMParser()).parseFromString(
    `<html>
      <body>
        <p>
          <select id="abc"></select>
        </p>
      </body>
    </html>`,
    "text/html",
  )!;
  // @ts-ignore //
  globalThis.document = document;

  const select = new Select({
    // @ts-ignore //
    el: document.querySelector("#abc")!,
    source: () => [{ text: "x", value: 1 }],
  });
  console.log(select.selections());

  assert(1 == 1);
});
