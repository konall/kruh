import { Select } from "../../../mod.ts";

const select = new Select({
  el: document.querySelector("#x")!,
  options: async (q) => {
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
});

document.addEventListener("keypress", (e) => {
  if (e.key === "<") {
    console.log(select.options());
  } else if (e.key === ">") {
    console.log(select.selected());
  }
});

const el = document.createElement("div");
el.innerHTML = `
  <div contenteditable><span style="color:red">XYZ</span>abc<button>Click</button></div>
`;
document.body.appendChild(el);
