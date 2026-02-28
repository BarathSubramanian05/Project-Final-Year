import React, { useEffect, useState } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import axiosInstance from "../axiosConfig";
import * as XLSX from "xlsx";
import { useEmployee } from "../../context/EmployeeContext";
import "../../styles/Manager/PivotTableCustom.css";
import PivotTable from "react-pivottable/PivotTable"; // extra import for safety
import { useToast } from "../../context/ToastContext";
// ✅ Safe custom patch for FilterBox (no undefined errors)




const patchPivotFilterBox = () => {
  const Pivot = require("react-pivottable/PivotTableUI"); // dynamic import ensures module is available
  const originalFilterBox = Pivot.FilterBox || PivotTableUI.FilterBox;



  if (!originalFilterBox) {
    return;
  }

  if (originalFilterBox.__patched) return; // avoid re-patching

  const PatchedFilterBox = function PatchedFilterBox(props) {
    const { attribute, values, valueFilter, onChange } = props;

    const allValues = Array.from(values);
    const selectedValues = allValues.filter((v) => !valueFilter[v]);
    const allSelected = selectedValues.length === allValues.length;
    const noneSelected = selectedValues.length === 0;
    const singleSelected = selectedValues.length === 1;
    const showSelectAll = noneSelected || singleSelected;


    const toggleAll = (selectAll) => {
      const newFilter = {};
      if (!selectAll) {
        // deselect all
        allValues.forEach((v) => (newFilter[v] = true));
      }
      onChange({ ...props, valueFilter: newFilter });
    };

    return (
      <div style={{ padding: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <b>{attribute}</b>
          {showSelectAll && (
            <button
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
              onClick={() => toggleAll(!allSelected)}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        <div
          style={{
            maxHeight: "180px",
            overflowY: "auto",
            borderTop: "1px solid #ddd",
            paddingTop: "4px",
          }}
        >
          {allValues.map((val, i) => (
            <label
              key={i}
              style={{
                display: "block",
                margin: "2px 0",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={!valueFilter[val]}
                onChange={() => {
                  const newFilter = { ...valueFilter };
                  if (newFilter[val]) delete newFilter[val];
                  else newFilter[val] = true;
                  onChange({ ...props, valueFilter: newFilter });
                }}
              />{" "}
              {String(val)}
            </label>
          ))}
        </div>
      </div>
    );
  };

  PatchedFilterBox.__patched = true;
  PivotTableUI.FilterBox = PatchedFilterBox;
};


const WorkPivotTable = () => {
  const [data, setData] = useState([]);
  const [pivotState, setPivotState] = useState({
    rows: ["Employee"],
    cols: ["Activity"],
    aggregatorName: "Sum",
    vals: ["Work Hours"],
    rendererName: "Table",
  });
  const { employee } = useEmployee();

  useEffect(() => {
    patchPivotFilterBox(); // apply filter dropdown customization
  }, []);

  useEffect(() => {
    if (!employee) return;

    const isAGM =
      employee.designation.trim() === "Assistant IT Manager" ||
      employee.designation.trim() === "Assistant General Manager"

    const endpoint = isAGM
      ? `/workdetails/all`
      : `/workdetails/manager/${employee.empId}`;

    // ✅ Fetch WorkDetails + All Projects in Parallel
    Promise.all([
      axiosInstance.get(endpoint),
      axiosInstance.get("/project/"),
    ])
      .then(([workRes, projectRes]) => {
        const workDetails = workRes.data || [];
        const allProjects = projectRes.data || [];

        // ✅ Create ProjectId → AssignedHours lookup
        const projectMap = new Map(
          allProjects.map((p) => [
            p.id,
            {
              name: p.projectName,
              assignedHours: p.assignedHours || 0,
            },
          ])
        );

        // ✅ Merge Assigned Hours into Pivot Data
        const pivotData = workDetails.map((item, index) => {
          const projectInfo = projectMap.get(item.projectId) || {};
          const assigned = projectInfo.assignedHours || 0;

          return {
            id: index,
            Employee: item.employeeName || "Unknown",
            // ✅ Show Assigned Hours next to Project
            Project: `${item.projectName || "Unassigned"} (${assigned} hrs)`,
            Activity: item.activityName || "No Activity",
            Status: item.status || "Unknown",
            "Work Hours": Number(item.workHours) || 0,
            Date: item.date || "",
            "Assigned Work": item.assignedWork || "",
          };
        });

        setData(pivotData);
      })
  }, [employee]);


  const exportPivotToExcel = () => {
    const table = document.querySelector(".pvtTable");
    if (!table) {
      showToast("No table to export!", "info");
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Work Analysis");
    const fileName = `Work_Details_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const { showToast } = useToast();


  const hasValidData = data.length > 0;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "20px",
        boxSizing: "border-box",
        background: "#f8fafc",
      }}
    >
      <h2 style={{ fontWeight: 600, marginBottom: "20px" }}>
        Work Analysis Pivot Table
      </h2>

      {hasValidData && (
        <button
          onClick={exportPivotToExcel}
          style={{
            marginBottom: "10px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Export to Excel
        </button>
      )}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "10px",
        }}
      >
        {hasValidData ? (
          <PivotTableUI
            data={data}
            onChange={setPivotState}
            {...pivotState}
            unusedOrientationCutoff={Infinity}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            {employee ? "Loading data..." : "Please select an employee"}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPivotTable;