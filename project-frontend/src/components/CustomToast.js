import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import styles from "../styles/CustomToast.module.css"

const icons = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

export default function CustomToast({ id, message, type = "info", onClose }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`${styles.toast} ${styles[type]}`}
    >
      <div className={styles.icon}>{icons[type]}</div>
      <div className={styles.content}>{message}</div>
      <button className={styles.close} onClick={() => onClose(id)}>
        ×
      </button>
    </motion.div>
  );
}
