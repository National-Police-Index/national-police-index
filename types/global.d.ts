// Type definitions for global Node.js extensions
declare namespace NodeJS {
  interface Global {
    gc?: () => void;
  }
}

// Extend the global object
declare const global: NodeJS.Global;
