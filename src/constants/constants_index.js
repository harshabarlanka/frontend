export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

import vegPickles from "../assets/categories/veg-pickles.png";
import nonVegPickles from "../assets/categories/non-veg-pickles.png";
import sweets from "../assets/categories/sweets.png";
import snacks from "../assets/categories/snacks.png";
import podis from "../assets/categories/podis.png";

export const CATEGORIES = [
  { value: "veg-pickles", label: "Veg Pickles", image: vegPickles },
  { value: "non-veg-pickles", label: "Non-Veg Pickles", image: nonVegPickles },
  { value: "sweets", label: "Sweets", image: sweets },
  { value: "snacks", label: "Snacks", image: snacks },
  { value: "podis", label: "Podis", image: podis },
];

export const ORDER_STATUSES = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    step: 0,
  },
  confirmed: {
    label: "Order Confirmed",
    color: "bg-blue-100 text-blue-800",
    step: 1,
  },
  preparing: {
    label: "Preparing Order",
    color: "bg-purple-100 text-purple-800",
    step: 2,
  },
  ready_for_pickup: {
    label: "Ready for Dispatch",
    color: "bg-orange-100 text-orange-800",
    step: 3,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800",
    step: 4,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    step: 5,
  },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", step: -1 },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700", step: -1 },
};

// ✅ FIXED SORT OPTIONS (MATCH BACKEND)
export const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-ratings.average", label: "Top Rated" },
  { value: "minPrice", label: "Price: Low to High" },
  { value: "-minPrice", label: "Price: High to Low" },
];

// PRICE FILTERS
export const PRICE_RANGES = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹200", min: "", max: "200" },
  { label: "₹200 – ₹400", min: "200", max: "400" },
  { label: "₹400 – ₹600", min: "400", max: "600" },
  { label: "Above ₹600", min: "600", max: "" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];
