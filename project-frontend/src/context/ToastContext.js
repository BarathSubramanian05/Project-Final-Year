import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CustomToast from "../components/CustomToast";
import styles from "../styles/CustomToast.module.css";
import { AnimatePresence } from "framer-motion";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

let idCounter = 0;
function genId() {
  idCounter += 1;
  return `toast_${Date.now()}_${idCounter}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    let el = document.getElementById("toast-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-root";
      document.body.appendChild(el);
    }
    containerRef.current = el;
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = genId();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {containerRef.current &&
        createPortal(
          <div className={styles.toastWrapper}>
            <AnimatePresence initial={false}>
              {toasts.map((t) => (
                <CustomToast
                  key={t.id}
                  id={t.id}
                  message={t.message}
                  type={t.type}
                  onClose={closeToast}
                />
              ))}
            </AnimatePresence>
          </div>,
          containerRef.current
        )}
    </ToastContext.Provider>
  );
}
