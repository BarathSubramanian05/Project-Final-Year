import React, { useState } from "react";
import axiosInstance from "../axiosConfig";
import styles from '../../styles/AGM/AddActivity.module.css'
import { useToast } from "../../context/ToastContext";

const AddActivityForm = () => {
  const [formData, setFormData] = useState({
    activityName: "",
    category: "",
    mainType: "",
    softDelete: false
  });

  const { showToast } = useToast();
  

  const categories = ["Productive", "Non-Productive"];
  const mainTypes = ["Modeling", "Detailing", "Checking", "Common"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.activityName.trim())
      return showToast("⚠️ Enter Activity Name","info");
    if (!formData.category) return showToast("⚠️ Select Category","warning");
    if (!formData.mainType) return showToast("⚠️ Select Main Type","warning");

    try {
      await axiosInstance.post("/activity/save", formData); 
      showToast("✅ Activity added successfully!","success");
      setFormData({ activityName: "", category: "", mainType: "" });
    } catch (error) {
      showToast("❌ Failed to add activity","error");
      setFormData({ activityName: "", category: "", mainType: "" });
    }
  };

  return (
    <div className={styles.container} >
      <h2>Add New Activity</h2>

      <div className={styles.fld}>
        <label>Activity Name</label>
        <input
          type="text"
          name="activityName"
          value={formData.activityName}
          onChange={handleChange}
        />
      </div>

      <div className={styles.fld}>
        <label>Category</label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fld}>
        <label>Main Type</label>
        <select name="mainType" value={formData.mainType} onChange={handleChange}>
          <option value="">Select Main Type</option>
          {mainTypes.map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        Add Activity
      </button>
    </div>
  );
};

export default AddActivityForm;
