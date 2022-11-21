"use client";

import { useState } from "react";
import { TFC } from "../../../__generated__/shared";
import type { CounterTranslation } from "./counter.translation";

interface CounterProps {
  initialValue: number;
}

type Option = "foo" | "bar" | "baz";

const pickOptions = <T extends readonly Option[]>(options: T) => {
  return options;
};

pickOptions(["foo", "bar"]);

export const Counter: TFC<CounterProps, CounterTranslation> = ({
  initialValue,
  t,
}) => {
  const [value, setValue] = useState(initialValue);
  return (
    <div>
      <code>{value}</code>
      <hr />
      <div>
        <button onClick={() => setValue((prev) => prev + 1)}>
          (+) {t["counter.increment"]}
        </button>
        <button onClick={() => setValue((prev) => prev - 1)}>
          (-) {t["counter.decrement"]}
        </button>
      </div>
    </div>
  );
};
