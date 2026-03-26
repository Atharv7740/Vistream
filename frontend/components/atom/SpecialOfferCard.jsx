import React from "react";
import { Check, ChevronRight } from "lucide-react";

const SpecialOfferCard = ({
  title,
  features,
  price,
  originalPrice,
  discountLabel,
  duration,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={`bg-purple-900 p-6 rounded-lg text-white relative mb-4 md:mb-0 cursor-pointer transition-all ${
        isActive
          ? "border-2 border-yellow-300 ring-2 ring-yellow-300/30"
          : "border-2 border-transparent hover:border-purple-600"
      }`}
      onClick={onClick}
    >
      {/* Selection indicator */}
      {isActive && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-purple-900" strokeWidth={3} />
        </div>
      )}

      {/* Arrow indicator on right side */}
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
      >
        <ChevronRight className="w-8 h-8 text-yellow-300" />
      </div>

      <div className="absolute top-2 right-2 px-3 py-1 bg-yellow-300 text-purple-900 text-xs uppercase font-semibold rounded">
        Special Offer
      </div>
      <div className="flex flex-col items-center text-center h-full justify-between">
        <div className="text-3xl font-bold mt-6 mb-2 w-full text-start">
          {title}
        </div>
        <ul className="text-sm mb-6 list-disc text-start pl-5">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <div className="flex justify-between items-center w-full">
          <div className="text-sm rounded font-bold border border-yellow-300 text-yellow-300 p-2">
            {duration}
          </div>
          <div className="text-4xl font-bold">₹{price}</div>
        </div>
        <div className="flex justify-end w-full mt-1">
          <div className="text-xs line-through text-gray-400 mr-2">
            ₹{originalPrice}
          </div>
          <div className="text-sm text-yellow-300">{discountLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferCard;
