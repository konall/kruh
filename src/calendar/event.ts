export interface Event {
  id: string;
  start: Date;
  end: Date;
  title: string;

  editable?: boolean;
}

export type Source = (start: Date, end: Date) => Array<Event>;
