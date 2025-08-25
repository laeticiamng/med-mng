import { createRoot } from 'react-dom/client'

// Pure JS test without React
const App = () => {
  console.log('🔥 Testing pure JS without React...');
  
  const element = document.createElement('div');
  element.style.cssText = `
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1a2e;
    color: white;
    font-family: Arial, sans-serif;
    text-align: center;
  `;
  
  element.innerHTML = `
    <div>
      <h1 style="font-size: 3rem; margin-bottom: 1rem;">MED-MNG</h1>
      <p style="font-size: 1.2rem; color: #ccc;">Pure JS test (no React)</p>
      <p style="font-size: 1rem; color: #999; margin-top: 2rem;">
        If you see this, JavaScript is working
      </p>
    </div>
  `;
  
  return element;
};

const root = document.getElementById("root");
if (root) {
  root.appendChild(App());
}
