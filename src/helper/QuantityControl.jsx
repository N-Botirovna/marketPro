"use client";

import React, { useState } from "react";
import Icon from "@/components/Icon";

const QuantityControl = ({ initialQuantity = 1, onChange }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const update = (next) => {
    setQuantity(next);
    onChange?.(next);
  };

  return (
    <div className="d-flex rounded-4 overflow-hidden">
      <button
        type="button"
        onClick={() => update(quantity > 1 ? quantity - 1 : quantity)}
        className="quantity__minus border border-end border-gray-100 flex-shrink-0 h-48 w-48 text-neutral-600 flex-center hover-bg-main-600 hover-text-white"
      >
        <Icon className="ph ph-minus" />
      </button>
      <input
        type="number"
        className="quantity__input flex-grow-1 border border-gray-100 border-start-0 border-end-0 text-center w-32 px-4"
        value={quantity}
        min={1}
        readOnly
      />
      <button
        type="button"
        onClick={() => update(quantity + 1)}
        className="quantity__plus border border-end border-gray-100 flex-shrink-0 h-48 w-48 text-neutral-600 flex-center hover-bg-main-600 hover-text-white"
      >
        <Icon className="ph ph-plus" />
      </button>
    </div>
  );
};

export default QuantityControl;
