// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }


//format
//  export function formatMoney(value) {
//   if (typeof value !== "number") return value;
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     maximumFractionDigits: 0,
//   }).format(value);
// }

//sum
export function sum(arr) {
  if (!Array.isArray(arr)) return 0
  return arr.reduce((a, b) => a + b, 0)
}

//format For numbers
export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num)
}