Project structure (recommended):

no-code-form-builder/
├─ package.json
├─ vite.config.js
├─ src/
│ ├─ main.jsx
│ ├─ App.jsx
│ ├─ assets/
│ ├─ styles/index.css
│ ├─ pages/
│ │ ├─ Dashboard.jsx
│ │ ├─ FormBuilderPage.jsx
│ │ └─ FormRendererPage.jsx
│ ├─ components/
│ │ ├─ ui/
│ │ │ ├─ Navbar.jsx
│ │ │ └─ Sidebar.jsx
│ │ ├─ builder/
│ │ │ ├─ FieldToolbox.jsx
│ │ │ ├─ FormCanvas.jsx
│ │ │ └─ FieldEditor.jsx
│ │ └─ form/
│ │ └─ FormRenderer.jsx
│ └─ lib/
│ └─ sampleData.js
└─ README.md