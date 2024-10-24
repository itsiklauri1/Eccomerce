import Image from "next/image";
import React from "react";

export default function CartButton() {
  return (
    <div
      className="w-[32px] overflow-hidden h-[32px] bg-green-500 rounded-md flex items-center justify-center  
    absolute top-3 right-[-50px] group-hover:right-3 z-50 transition-all duration-200 ease-in-out cursor-pointer
    "
    >
      <Image
        alt="cart"
        width={15}
        height={15}
        src={"/icons/header/trolley.png"}
      />
    </div>
  );
}
