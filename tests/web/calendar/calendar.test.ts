import { Calendar } from "../../../mod.ts";

const calendar = new Calendar(document.querySelector("#calendar")!);
calendar.init({
  source: () => []
});

document.addEventListener("keydown", e => {
  if (e.key === "<") {
    calendar.prevMonth();
  } else if (e.key === ">") {
    calendar.nextMonth();
  }
})
