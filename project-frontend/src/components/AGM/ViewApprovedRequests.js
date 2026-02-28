  import React, { useEffect, useState } from "react";
  import axiosInstance from "../axiosConfig";
    import styles from "../../styles/Manager/ViewRequests.module.css";
    import * as XLSX from "xlsx";

    const ViewApprovedRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [managerList, setManagerList] = useState([]);
    const [selectedManager, setSelectedManager] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("All");
    const [customRange, setCustomRange] = useState({ from: "", to: "" });
    const [showCustomBox, setShowCustomBox] = useState(false);


    useEffect(() => {
        axiosInstance
        .get("/leave/all")
        .then((res) => {
            setRequests(res.data);
            setFilteredRequests(res.data);
            const managers = [...new Set(res.data.map((r) => r.managerName))];
            setManagerList(managers);
        })
    }, []);

    const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-");
  return new Date(y, m - 1, d);  // Local timezone (not UTC!)
};


    useEffect(() => {
  let data = [...requests];
  const today = new Date();

  // Filter by Manager
  if (selectedManager !== "All") {
    data = data.filter((r) => r.managerName === selectedManager);
  }

  // Filter by Status
  if (statusFilter !== "All") {
    data = data.filter((r) => r.status === statusFilter);
  }

  // DATE FILTER FIXED
  if (dateFilter === "Today") {
    data = data.filter(
      (r) => parseLocalDate(r.appliedDate).toDateString() === today.toDateString()
    );
  } 
  else if (dateFilter === "Yesterday") {
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    data = data.filter(
      (r) =>
        parseLocalDate(r.appliedDate).toDateString() ===
        yesterday.toDateString()
    );
  } 
  else if (dateFilter === "Last 7 Days") {
    const past7 = new Date();
    past7.setDate(today.getDate() - 7);
    data = data.filter(
      (r) =>
        parseLocalDate(r.appliedDate) >= past7 &&
        parseLocalDate(r.appliedDate) <= today
    );
  } 
  else if (dateFilter === "Last 30 Days") {
    const past30 = new Date();
    past30.setDate(today.getDate() - 30);
    data = data.filter(
      (r) =>
        parseLocalDate(r.appliedDate) >= past30 &&
        parseLocalDate(r.appliedDate) <= today
    );
  } 
  else if (dateFilter === "Custom" && customRange.from && customRange.to) {
    const from = parseLocalDate(customRange.from);
    const to = parseLocalDate(customRange.to);
    data = data.filter(
      (r) =>
        parseLocalDate(r.appliedDate) >= from &&
        parseLocalDate(r.appliedDate) <= to
    );
  }

  data.sort(
    (a, b) =>
      parseLocalDate(b.appliedDate) - parseLocalDate(a.appliedDate)
  );

  setFilteredRequests(data);
}, [selectedManager, statusFilter, dateFilter, customRange, requests]);


    // 🔹 Clear Filters
    const clearFilters = () => {
        setSelectedManager("All");
        setStatusFilter("All");
        setDateFilter("All");
        setCustomRange({ from: "", to: "" });
        setFilteredRequests(requests);
        setShowCustomBox(false);
    };

    const exportToExcel = () => {
  if (filteredRequests.length === 0) {
    alert("No data available to export!");
    return;
  }

  const worksheetData = filteredRequests.map((r) => ({
    Manager: r.managerName || "-",
    Employee: r.employeeName || "-",
    AppliedDate: r.appliedDate || "-",
    Type: r.type,
    From: r.fromDate || "-",
    To: r.toDate || "-",
    LeaveType: r.type === "Leave" ? r.leaveType || "-" : "-",
    LeaveDays: r.type === "Leave" ? r.leaveDays || "-" : "-",
    PermissionInTime: r.type === "Permission" ? r.permissionInTime || "-" : "-",
    PermissionOutTime: r.type === "Permission" ? r.permissionOutTime || "-" : "-",
    PermissionHours: r.type === "Permission" ? r.permissionHours || "-" : "-",
    Reason: r.reason || "-",
    Status: r.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
  const fileName = `Leave_Requests_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};


    return (
        <div className={styles.container}>
        <h2 className={styles.title}>Leave Request Overview</h2>

        {/* Filters */}
        <div className="filterBarWrapper"></div>
        <div className={styles.filterBar}>
            {/* Date Filter */}
            <select
  value={dateFilter}
  onChange={(e) => {
    const value = e.target.value;
    setDateFilter(value);
    // show box only when "Custom" is chosen
    setShowCustomBox(value === "Custom");
  }}
  className={styles.filterSelect}
>
  <option value="All">All Dates</option>
  <option value="Today">Today</option>
  <option value="Yesterday">Yesterday</option>
  <option value="Last 7 Days">Last 7 Days</option>
  <option value="Last 30 Days">Last 30 Days</option>
  <option value="Custom">Custom Range</option>
</select>


            {/* Manager Filter */}
            <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className={styles.filterSelect}
            >
            <option value="All">All Managers</option>
            {managerList.map((m) => (
                <option key={m} value={m}>
                {m}
                </option>
            ))}
            </select>

            {/* Status Filter */}
            <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
            >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            </select>

            {/* Clear Button */}
            <button className={styles.clearBtn} onClick={clearFilters}>
            Clear Filters
            </button>
        </div>

        {/* Custom Date Picker - shows below menu */}
        {showCustomBox && (
  <div className={styles.dateRangeBox}>
    <div className={styles.dateInputs}>
      <label>
        From:
        <input
          type="date"
          value={customRange.from}
          onChange={(e) => {
            const updated = { ...customRange, from: e.target.value };
            setCustomRange(updated);
            // ✅ Close when both dates selected
            if (updated.from && updated.to) {
              setShowCustomBox(false);
            }
          }}
        />
      </label>
      <label>
        To:
        <input
          type="date"
          value={customRange.to}
          onChange={(e) => {
            const updated = { ...customRange, to: e.target.value };
            setCustomRange(updated);
            // ✅ Close when both dates selected
            if (updated.from && updated.to) {
              setShowCustomBox(false);
            }
          }}
        />
      </label>
    </div>
  </div>
)}

<button className={styles.exportBtn} onClick={exportToExcel}>
  Export to Excel
</button>


        {/* Table */}
        <div className={styles.tableWrapper}>
            <table className={styles.requestTable}>
            <thead>
                <tr>
                <th>Manager</th>
                <th>Name</th>
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
                {filteredRequests.length === 0 ? (
                <tr>
                    <td colSpan="13" className={styles.noData}>
                    No requests found.
                    </td>
                </tr>
                ) : (
                filteredRequests.map((r) => (
                    <tr key={r.id}>
                    <td>{r.managerName || "-"}</td>
                    <td>{r.employeeName || "-"}</td>
                    <td>{r.appliedDate || "-"}</td>
                    <td>{r.type}</td>
                    <td>{r.fromDate || "-"}</td>
                    <td>{r.toDate || "-"}</td>
                    <td>{r.type === "Leave" ? r.leaveType || "-" : "-"}</td>
                    <td>{r.type === "Leave" ? r.leaveDays || "-" : "-"}</td>
                    <td>{r.type === "Permission" ? r.permissionInTime || "-" : "-"}</td>
                    <td>{r.type === "Permission" ? r.permissionOutTime || "-" : "-"}</td>
                    <td>{r.type === "Permission" ? r.permissionHours || "-" : "-"}</td>
                    <td>{r.reason || "-"}</td>
                    <td
                        className={
                        r.status === "Approved"
                            ? styles.statusApproved
                            : r.status === "Rejected"
                            ? styles.statusRejected
                            : styles.statusPending
                        }
                    >
                        {r.status}
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
       
        </div>
       
    );
    };

    export default ViewApprovedRequests;