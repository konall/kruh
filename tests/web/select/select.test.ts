import { Select } from "../../../mod.ts";

const select = new Select(document.querySelector("#x")!);
select.init({
  source: async (q) => {
    if (q.length < 3) {
      return [];
    }

    const r = await fetch("https://jsonplaceholder.typicode.com/todos");
    const data = await r.json();
    return data.filter((x) => x.title.includes(q)).map((x) => ({
      text: x.title,
      value: x.id,
      extra: x.title.length,
    }));
  },
  
  events: {
    whenInitialised: async () => {
      await select.loadOptions("est");
    }
  }
});

document.addEventListener("keypress", (e) => {
  if (e.key === "<") {
    console.log(select.options());
  } else if (e.key === ">") {
    console.log(select.selections());
  }
});
