import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended, // Dùng bộ luật chuẩn được khuyên dùng
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Cho phép code chạy trên web
        ...globals.node,    // THÊM DÒNG NÀY: Cho phép dùng require, process, console... của Node.js
      },
    },
    rules: {
      "no-unused-vars": "warn", // Biến không dùng thì chỉ cảnh báo (vàng), đừng báo lỗi (đỏ)
      "no-undef": "error",
    },
  },
];