import React, { useState, useEffect } from "react";
import styles from "../../styles/Employee/LeavePermissionForm.module.css";
import { useEmployee } from "../../context/EmployeeContext";
import axiosInstance from "../axiosConfig";
import { useToast } from "../../context/ToastContext";

const LeavePermissionForm = () => {
  const [activeTab, setActiveTab] = useState("apply");
  const [requests, setRequests] = useState([]);
  const { employee, loading } = useEmployee();
  const [formData, setFormData] = useState({
    employeeId: employee?.empId || "",      // from logged-in user
    managerId: employee?.reportingToId || "",
    type: "", // Leave / Permission
    leaveDuration: "", // One Day / Multiple Days
    leaveHalf: "",
    fromDate: "",
    toDate: "",
    leaveDays: "",
    leaveType: "", // CL/SL/LOP
    reason: "",
    permissionInTime: "",
    permissionOutTime: "",
    permissionHours: "",
    permissionMinutes: "",
  });
  const [leaveBalance, setLeaveBalance] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (employee?.empId) {
      axiosInstance
        .get(`/leave/balance/employee/${employee.empId}`)
        .then((res) => {
          setLeaveBalance(res.data);
        })

    }
  }, [employee]);


  useEffect(() => {
    if (!loading && !employee) {
      showToast("Employee not found or not logged in!", "error");
    }
  }, [loading, employee]);
  useEffect(() => {
    if (activeTab === "view" && employee?.empId) {
      axiosInstance
        .get(`/leave/employee/${employee.empId}`)
        .then((res) => {
          const sorted = res.data.sort(
            (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)
          );
          setRequests(sorted);

        })

    }
  }, [activeTab, employee]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Leave days calculation
  const calculateLeaveDays = (from, to) => {
    if (from && to) {
      const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1;
      setFormData((prev) => ({ ...prev, leaveDays: diff }));
    }
  };

  // Permission time calculation
  const calculatePermissionTime = (inTime, outTime) => {
    if (inTime && outTime) {
      const inDate = new Date(`1970-01-01T${inTime}:00`);
      const outDate = new Date(`1970-01-01T${outTime}:00`);

      // If In time is smaller than Out time (e.g., crosses midnight)
      if (inDate < outDate) {
        inDate.setDate(inDate.getDate() + 1);
      }

      const diffMs = inDate - outDate; // difference in milliseconds
      const diffMinutes = diffMs / (1000 * 60); // difference in minutes

      const hours = diffMinutes / 60; // hours as decimal
      const minutes = diffMinutes;    // total minutes

      setFormData((prev) => ({
        ...prev,
        permissionHours: hours.toFixed(2), // 1.50 hours
        permissionMinutes: minutes,        // total minutes
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      showToast(validation.msg, "warning");
      return;
    }

    // ✅ Verify available leave balance before submit
    if (formData.type === "Leave") {
      const days = parseFloat(formData.leaveDays || 0);

      if (formData.leaveType === "CL" && leaveBalance?.casualLeaves < days) {
        showToast(`You only have ${leaveBalance.casualLeaves} CL remaining.`, "info");
        return;
      }

      if (formData.leaveType === "SL" && leaveBalance?.sickLeaves < days) {
        showToast(`You only have ${leaveBalance.sickLeaves} SL remaining.`, "info");
        return;
      }

      if (formData.leaveType === "Marriage Leave" && leaveBalance?.marriageLeaves < days) {
        showToast(`You only have ${leaveBalance.marriageLeaves} Marriage leaves remaining.`, "info");
        return;
      }

      if (formData.leaveType === "Maternity Leave" && leaveBalance?.maternityLeaves < days) {
        showToast(`You only have ${leaveBalance.maternityLeaves} Maternity leaves remaining.`, "info");
        return;
      }
    }

    if (formData.type === "Permission") {
      const requestedHours = parseFloat(formData.permissionHours || 0);
      const availableHours = parseFloat(leaveBalance?.permissionBalance || 0);

      if (requestedHours > availableHours) {
        showToast(`You only have ${availableHours} hours of permission left, but you requested ${requestedHours} hours.`, "info");
        return;
      }
    }


    try {
      const payload = {
        employee: { empId: employee.empId },       // 👈 nested object
        manager: { empId: employee.reportingToId }, // 👈 nested object
        type: formData.type,
        leaveDuration: formData.leaveDuration,
        fromDate: formData.fromDate || null,
        toDate: formData.toDate || null,
        leaveDays: formData.leaveDays || 0,
        leaveType: formData.leaveType || null,
        leaveHalf: formData.leaveDuration === "Half Day"
          ? formData.leaveHalf
          : null, // 👈 NEW
        reason: formData.reason,
        permissionInTime: formData.permissionInTime || null,
        permissionOutTime: formData.permissionOutTime || null,
        permissionHours: formData.permissionHours || null,
        permissionMinutes: formData.permissionMinutes || null,
        appliedDate: new Date().toISOString().split("T")[0],
      };

      const response = await axiosInstance.post("/leave/apply", payload);
      console.log(response);
      if (response.status === 200 || response.status === 201) {
        showToast("✅ Leave/Permission submitted successfully!", "success");

        // Reset form after success
        setFormData({
          type: "",
          leaveDuration: "",
          fromDate: "",
          toDate: "",
          leaveDays: "",
          leaveType: "",
          reason: "",
          permissionInTime: "",
          permissionOutTime: "",
          permissionHours: "",
          permissionMinutes: "",
        });
      } else {
        showToast("⚠️ Failed to submit Leave/Permission!", "error");
      }

    } catch (error) {

      showToast("❌ Failed to save Leave/Permission!", "error");
    }
  };

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const validateForm = () => {
    if (!employee) return { valid: false, msg: "Employee not found or not logged in!" };

    if (!formData.type) return { valid: false, msg: "Please select Leave or Permission type." };

    if (formData.type === "Leave") {
      if (!formData.leaveDuration) return { valid: false, msg: "Please select Leave Duration." };

      if (formData.leaveDuration === "Half Day") {
        if (!formData.fromDate)
          return { valid: false, msg: "Please select Leave Date." };

        if (!formData.leaveHalf)
          return { valid: false, msg: "Please select FN or AN." };
      }

      if (formData.leaveDuration === "One Day" && !formData.fromDate)
        return { valid: false, msg: "Please select Leave Date." };

      if (formData.leaveDuration === "Multiple Days") {
        if (!formData.fromDate || !formData.toDate)
          return { valid: false, msg: "Please select both From and To Dates." };
      }

      if (!formData.leaveType) return { valid: false, msg: "Please select Leave Type." };
      if (!formData.reason.trim()) return { valid: false, msg: "Please provide a reason for Leave." };
    }

    if (formData.type === "Permission") {
      if (!formData.fromDate) return { valid: false, msg: "Please select a Date for Permission." };
      if (!formData.permissionOutTime || !formData.permissionInTime)
        return { valid: false, msg: "Please fill both Out Time and In Time." };
      if (!formData.reason.trim()) return { valid: false, msg: "Please provide a reason for Permission." };
    }

    return { valid: true };
  };

  const today = new Date().toISOString().split("T")[0];

  const weekBefore = new Date();
  weekBefore.setDate(weekBefore.getDate() - 7);
  const formattedWeekBefore = weekBefore.toISOString().split("T")[0];

  return (

    <div
      className={`${styles.container} ${activeTab === "view" ? styles.viewContainer : ""
        }`}
    >


      <h2>Leave & Permission Portal</h2>

      {/* Leave Balance Cards */}
      {leaveBalance && activeTab == "apply" && (
        <div className={styles.leaveBalanceContainer}>
          <div className={`${styles.leaveCard} ${styles.casual}`}>
            <span className={styles.leaveCount}>{leaveBalance.casualLeaves}</span>
            <br/>
            <span className={styles.leaveLabel}>Casual Leave</span>
          </div>

          <div className={`${styles.leaveCard} ${styles.sick}`}>
            <span className={styles.leaveCount}>{leaveBalance.sickLeaves}</span>
            <br/>
            <span className={styles.leaveLabel}>Sick Leave</span>
          </div>

          <div className={`${styles.leaveCard} ${styles.marriage}`}>
            <span className={styles.leaveCount}>{leaveBalance.marriageLeaves}</span>
            <br/>
            <span className={styles.leaveLabel}>Marriage Leave</span>
          </div>

          <div className={`${styles.leaveCard} ${styles.maternity}`}>
            <span className={styles.leaveCount}>{leaveBalance.maternityLeaves}</span>
            <br/>
            <span className={styles.leaveLabel}>Maternity Leave</span>
          </div>
        </div>
      )}




      {/* Toggle Buttons */}
      <div className={styles.filterButtons}>
        <button
          className={`${styles.filterBtn} ${activeTab === "apply" ? styles.active : ""}`}
          onClick={() => setActiveTab("apply")}
        >
          Apply Leave / Permission
        </button>
        <button
          className={`${styles.filterBtn} ${activeTab === "view" ? styles.active : ""}`}
          onClick={() => setActiveTab("view")}
        >
          View Status
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === "apply" ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Employee Info */}
          <div className={styles.field}>
            <label>Employee ID</label>
            <input type="text" value={employee.empId || ""} readOnly />
          </div>

          <div className={styles.field}>
            <label>Employee Name</label>
            <input type="text" value={employee.name || ""} readOnly />
          </div>

          <div className={styles.field}>
            <label>Role</label>
            <input type="text" value={employee.designation || ""} readOnly />
          </div>

          <div className={styles.field}>
            <label>Applied Date</label>
            <input type="text" value={new Date().toISOString().split("T")[0]} readOnly />
          </div>

          {/* Type Selection */}
          <div className={styles.field}>
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="Leave">Leave</option>
              {leaveBalance?.permissionBalance > 0 && (
                <option value="Permission">Permission</option>
              )}
            </select>
          </div>

          {/* Leave Form */}
          {formData.type === "Leave" && (
            <>

              <div className={styles.field}>
                <label>Leave Type</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  disabled={!leaveBalance}
                >
                  <option value="">Select Leave Type</option>
                  {leaveBalance?.casualLeaves > 0 && <option value="CL">CL</option>}
                  {leaveBalance?.sickLeaves > 0 && <option value="SL">SL</option>}
                  <option value="LOP">LOP</option>
                  {leaveBalance?.marriageLeaves > 0 && <option value="Marriage Leave">Marriage Leave</option>}
                  {leaveBalance?.maternityLeaves > 0 && <option value="Maternity Leave">Maternity Leave</option>}

                </select>
              </div>


              <div className={styles.field}>
                <label>Leave Duration</label>
                <select
                  name="leaveDuration"
                  value={formData.leaveDuration}
                  onChange={handleChange}
                >
                  <option value="">Select Duration</option>
                  <option value="Half Day">Half Day</option>
                  <option value="One Day">One Day</option>
                  <option value="Multiple Days">Multiple Days</option>
                </select>
              </div>

              {formData.leaveDuration === "Half Day" && (
                <>
                  <div className={styles.field}>
                    <label>Leave Date</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      min={today}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fromDate: e.target.value,
                          leaveDays: 0.5
                        })
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Half Day Type</label>
                    <select
                      name="leaveHalf"
                      value={formData.leaveHalf}
                      onChange={handleChange}
                    >
                      <option value="">Select Half</option>
                      <option value="FN">Forenoon (FN)</option>
                      <option value="AN">Afternoon (AN)</option>
                    </select>
                  </div>
                </>
              )}


              {formData.leaveDuration === "One Day" && (
                <>
                  <div className={styles.field}>
                    <label>Leave Date</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      min={
                        formData.leaveType === "SL" || formData.leaveType === "Marriage Leave" || formData.leaveType === "Maternity Leave"
                          ? undefined // no restriction
                          : formData.leaveType === "CL"
                            ? formattedWeekBefore // allow 1 week before today
                            : today // only today and future
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, fromDate: e.target.value, leaveDays: 1 })
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label>No of Days</label>
                    <input type="number" value={formData.leaveDays || 1} readOnly />
                  </div>
                </>
              )}

              {formData.leaveDuration === "Multiple Days" && (
                <>
                  <div className={styles.field}>
                    <label>From Date</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      min={
                        formData.leaveType === "SL" || formData.leaveType === "Marriage Leave" || formData.leaveType === "Maternity Leave"
                          ? undefined // no restriction
                          : formData.leaveType === "CL"
                            ? formattedWeekBefore // allow 1 week before today
                            : today // only today and future
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, fromDate: e.target.value }));
                        calculateLeaveDays(e.target.value, formData.toDate);
                      }}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>To Date</label>
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      min={
                        formData.leaveType === "SL" || formData.leaveType === "Marriage Leave" || formData.leaveType === "Maternity Leave"
                          ? formData.fromDate // no restriction
                          : formData.leaveType === "CL"
                            ? formData.fromDate // allow 1 week before today
                            : today // only today and future
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, toDate: e.target.value }));
                        calculateLeaveDays(formData.fromDate, e.target.value);
                      }}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>No of Days</label>
                    <input type="number" value={formData.leaveDays || ""} readOnly />
                  </div>
                </>
              )}



              <div className={styles.field}>
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Reason for Leave"
                />
              </div>
            </>
          )}

          {/* Permission Form */}
          {formData.type === "Permission" && (
            <>
              <div className={styles.field}>
                <label>Date</label>
                <input
                  type="date"
                  name="fromDate"
                  min={formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                  max={formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))}
                  value={formData.fromDate}
                  onChange={handleChange}
                />
              </div>


              <div className={styles.field}>
                <label>Out Time (Leave Time)</label>
                <input
                  type="time"
                  name="permissionOutTime"
                  value={formData.permissionOutTime}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, permissionOutTime: e.target.value }));
                    if (formData.permissionInTime) {
                      calculatePermissionTime(formData.permissionInTime, e.target.value);
                    }
                  }}
                />
              </div>

              <div className={styles.field}>
                <label>In Time (Return Time)</label>
                <input
                  type="time"
                  name="permissionInTime"
                  value={formData.permissionInTime}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, permissionInTime: e.target.value }));
                    if (formData.permissionOutTime) {
                      calculatePermissionTime(e.target.value, formData.permissionOutTime);
                    }
                  }}
                />
              </div>

              <div className={styles.field}>
                <label>Permission Hours</label>
                <input type="text" value={formData.permissionHours} readOnly />
              </div>

              <div className={styles.field}>
                <label>Permission Minutes</label>
                <input type="text" value={formData.permissionMinutes} readOnly />
              </div>

              <div className={styles.field}>
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Reason for Permission"
                />
              </div>
            </>
          )}

          <button type="submit" className={styles.submitBtn}>
            Submit
          </button>
        </form>
      ) : (
        <table className={styles.requestTable}>
          <thead>
            <tr>
              <th>Applied</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Leave Type</th>
              <th>No. Days</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Hours</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="11" className={styles.noData}>
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ width: "85px" }}>{r.appliedDate || "-"}</td>
                  <td>{r.type}</td>
                  <td style={{ width: "85px" }}>{r.fromDate || "-"}</td>
                  <td style={{ width: "85px" }}>{r.toDate || "-"}</td>
                  <td>{r.type === "Leave" ? r.leaveType || "-" : "-"}</td>
                  <td>{r.type === "Leave" ? r.leaveDays || "-" : "-"}</td>
                  <td>{r.type === "Permission" ? r.permissionInTime || "-" : "-"}</td>
                  <td>{r.type === "Permission" ? r.permissionOutTime || "-" : "-"}</td>
                  <td>{r.type === "Permission" ? r.permissionHours || "-" : "-"}</td>
                  <td>{r.reason || "-"}</td>
                  <td
                    style={{
                      color:
                        r.status?.trim().toLowerCase() === "approved" ? "#16a34a" :
                          r.status?.trim().toLowerCase() === "rejected" ? "#dc2626" : "#f59e0b",
                      fontWeight: "600"
                    }}
                  >
                    {r.status}
                  </td>


                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeavePermissionForm;
