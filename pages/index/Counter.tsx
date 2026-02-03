import { useState } from "react";
import { onIncrement } from "./Counter.telefunc";

export function Counter() {
  const [count, setCount] = useState(0);

  const handleIncrement = async () => {
    const newCount = await onIncrement(count);
    setCount(newCount);
  };

  return (
    <button
      type="button"
      className={
        "inline-block border border-black rounded bg-gray-200 px-2 py-1 text-xs font-medium uppercase leading-normal"
      }
      onClick={handleIncrement}
    >
      Counter {count}
    </button>
  );
}
