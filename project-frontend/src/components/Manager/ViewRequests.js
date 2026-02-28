import React, { useEffect, useState } from "react";
import styles from "../../styles/Manager/ViewRequests.module.css";
import { useEmployee } from "../../context/EmployeeContext";
import { useToast } from "../../context/ToastContext";
import axiosInstance from "../axiosConfig";

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [showCustomBox, setShowCustomBox] = useState(false);


  const { employee, loading } = useEmployee();
  const { showToast } = useToast();


  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-");
    return new Date(y, m - 1, d, 0, 0, 0, 0); // normalize time
  };



  const applyFilters = (allRequests, statusFilter, search, dateFilter, customRange) => {
    let data = [...allRequests];
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    // Status
    if (statusFilter !== "All") {
      data = data.filter((r) => r.status === statusFilter);
    }

    // Search
    if (search) {
      data = data.filter((r) =>
        r.employeeName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter === "Today") {
      data = data.filter(
        (r) =>
          parseLocalDate(r.appliedDate)?.toDateString() ===
          today.toDateString()
      );
    } else if (dateFilter === "Yesterday") {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      data = data.filter(
        (r) =>
          parseLocalDate(r.appliedDate)?.toDateString() ===
          y.toDateString()
      );
    } else if (dateFilter === "Last 7 Days") {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      data = data.filter(
        (r) =>
          parseLocalDate(r.appliedDate) >= past7 &&
          parseLocalDate(r.appliedDate) <= today
      );
    } else if (dateFilter === "Last 30 Days") {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      data = data.filter(
        (r) =>
          parseLocalDate(r.appliedDate) >= past30 &&
          parseLocalDate(r.appliedDate) <= today
      );
    } else if (dateFilter === "Custom" && customRange.from && customRange.to) {
      const from = parseLocalDate(customRange.from);
      const to = parseLocalDate(customRange.to);
      data = data.filter(
        (r) =>
          parseLocalDate(r.appliedDate) >= from &&
          parseLocalDate(r.appliedDate) <= to
      );
    }

    return data;
  };


  const fetchRequests = async () => {
    if (!employee?.empId) return;

    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axiosInstance.get(`/leave/manager/${employee.empId}`),
        axiosInstance.get(`/leave/manager-approved/${employee.empId}`),
      ]);

      const allRequests = [...pendingRes.data, ...approvedRes.data];
      setRequests(allRequests);

      const filtered = applyFilters(
        allRequests,
        filter,
        searchText,
        dateFilter,
        customRange
      );
      setFilteredRequests(filtered);

    } catch (err) {

    }
  };


  useEffect(() => {
    fetchRequests();
  }, [employee]);


  // Filter change handler
  const handleFilter = (category) => {
    setFilter(category);
    const filtered = applyFilters(
      requests,
      category,
      searchText,
      dateFilter,
      customRange
    );

    setFilteredRequests(filtered);
  };


  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = applyFilters(
      requests,
      filter,
      value,
      dateFilter,
      customRange
    );
    setFilteredRequests(filtered);

  };

  const clearSearch = () => {
    setSearchText("");
    const filtered = applyFilters(
      requests,
      filter,
      "",
      dateFilter,
      customRange
    );

    setFilteredRequests(filtered);
  };


  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/leave/status/${id}`, null, {
        params: { status: "Approved" },
      });
      showToast("Request Approved ✅", "success");
      await fetchRequests(); // 🔁 refetch after approval
      window.dispatchEvent(new Event("refreshPendingCount"));
    } catch (err) {

      const backendMsg =
        err.response?.data?.message || err.response?.data || "Something went wrong while stopping work!";
      showToast(backendMsg, "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.delete(`/leave/${id}`);
      showToast("Request Rejected ❌", "success");
      await fetchRequests(); // 🔁 refetch after rejection
      window.dispatchEvent(new Event("refreshPendingCount"));
    } catch (err) {

      showToast("Failed to reject request!", "error");
    }
  };




  if (loading) return <div className={styles.noData}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Leave & Permission Requests</h2>

      {/* Filter Buttons */}
      <div className={styles.filterButtons}>
        {["Pending", "Approved"].map((category) => (
          <button
            key={category}
            onClick={() => handleFilter(category)}
            className={`${styles.filterBtn} ${filter === category ? styles.active : ""
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.filterBar}>
        <select
          value={dateFilter}
          onChange={(e) => {
            const value = e.target.value;
            setDateFilter(value);
            setShowCustomBox(value === "Custom");

            const filtered = applyFilters(
              requests,
              filter,
              searchText,
              value,
              customRange
            );
            setFilteredRequests(filtered);
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

        <button
          className={styles.clearBtn}
          onClick={() => {
            setDateFilter("All");
            setCustomRange({ from: "", to: "" });
            setShowCustomBox(false);
            setFilteredRequests(
              applyFilters(requests, filter, searchText, "All", {
                from: "",
                to: "",
              })
            );
          }}
        >
          Clear
        </button>
      </div>


      {showCustomBox && (
        <div className={styles.dateRangeBox}>
          <label>
            From:
            <input
              type="date"
              value={customRange.from}
              onChange={(e) => {
                const updated = { ...customRange, from: e.target.value };
                setCustomRange(updated);

                if (updated.from && updated.to) {
                  const filtered = applyFilters(
                    requests,
                    filter,
                    searchText,
                    dateFilter,
                    updated
                  );
                  setFilteredRequests(filtered);
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

                if (updated.from && updated.to) {
                  const filtered = applyFilters(
                    requests,
                    filter,
                    searchText,
                    dateFilter,
                    updated
                  );
                  setFilteredRequests(filtered);
                  setShowCustomBox(false);
                }
              }}

            />
          </label>
        </div>
      )}


      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search by employee name..."
          value={searchText}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        {searchText && (
          <button
            className={styles.clearButton}
            onClick={clearSearch}
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>


      <div className={styles.tableWrapper}>
        <table className={styles.requestTable}>
          <thead>
            <tr>
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
              {filter !== "Approved" && <th>Actions</th>}
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
                        : styles.statusPending
                    }
                  >
                    {r.status}
                  </td>
                  {filter !== "Approved" && r.status === "Pending" && (
                    <td>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApprove(r.id)}
                      >
                        ✓
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleReject(r.id)}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewRequests;
