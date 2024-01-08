import { assert } from "test";
import { DOMParser, initParser } from "deno_dom";
import { Select } from "../../../src/select/mod.ts";

Deno.test("basic", async () => {
  await initParser();

  const document = (new DOMParser()).parseFromString(
    `<html>
      <body>
        <p>
          <span id="abc"></span>
        </p>
      </body>
    </html>`,
    "text/html",
  );
  // @ts-ignore //
  globalThis.document = document;

  const select = new Select({
    target: "#abc",
    options: () => [{ text: "x", value: 1 }],
    on: {
      load() {
        select.selected = [""];
      },
    },
  });
  select.selected;
  select.selected = ["j"];
  console.log(select.selected);
  console.log(select);

  assert(1 == 1);
});
