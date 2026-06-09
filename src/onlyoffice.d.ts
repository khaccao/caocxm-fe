// src/onlyoffice.d.ts

// Khai báo kiểu cho DocsAPI của OnlyOffice
interface DocsAPI {
    DocEditor: new (id: string, config: object) => any;
  }
  
  // Khai báo DocsAPI như một thuộc tính của window
  interface Window {
    DocsAPI?: DocsAPI;
  }