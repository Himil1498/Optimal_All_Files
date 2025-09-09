import ReactDOM from "react-dom/client"; // ✅ updated import
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";
import "./index.css";

// ✅ Create root
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

// ✅ Render the app
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
