import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";

import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, CartesianGrid, Legend
} from "recharts";

const LeaveDashboard = () => {

    const [typeData, setTypeData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);

    const COLORS = [
        "#4CAF50", // Green
        "#2196F3", // Blue
        "#FFC107", // Yellow
        "#FF5722", // Orange
        "#9C27B0", // Purple
        "#E91E63"  // Pink
    ];

    useEffect(() => {

        axios.get("/leave-analytics/types")
            .then(res => formatType(res.data));

        axios.get("/leave-analytics/status")
            .then(res => formatStatus(res.data));

        axios.get("/leave-analytics/monthly")
            .then(res => formatMonthly(res.data));

        axios.get("/leave-analytics/employee")
            .then(res => formatEmployee(res.data));

    }, []);

    // Format backend data
    const formatType = (data) => {
        setTypeData(data.map(d => ({
            name: d[0],
            value: d[1]
        })));
    };

    const formatStatus = (data) => {
        setStatusData(data.map(d => ({
            name: d[0],
            count: d[1]
        })));
    };

    const formatMonthly = (data) => {
        setMonthlyData(data.map(d => ({
            month: "M" + d[0],
            days: d[1]
        })));
    };

    const formatEmployee = (data) => {
        setEmployeeData(data.map(d => ({
            name: d[0],
            days: d[1]
        })));
    };

    const containerStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
        gap: "25px",
        padding: "20px"
    };

    const cardStyle = {
        background: "#ffffff",
        borderRadius: "15px",
        padding: "20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        transition: "0.3s"
    };

    return (
        <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>

            <h2 style={{
                textAlign: "center",
                padding: "20px",
                fontSize: "28px"
            }}>
                📊 Leave Analytics Dashboard
            </h2>

            <div style={containerStyle}>

                {/* Leave Type */}
                <div style={cardStyle}>
                    <h3>Leave Type Distribution</h3>

                    <PieChart width={350} height={280}>
                        <Legend />
                        <Tooltip />

                        <Pie
                            data={typeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label
                        >
                            {typeData.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </div>


                {/* Status */}
                <div style={cardStyle}>
                    <h3>Leave Status</h3>

                    <BarChart width={420} height={280} data={statusData}>
                        <Legend />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />

                        <Bar dataKey="count" name="Requests">
                            {statusData.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </div>


                {/* Monthly */}
                <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                    <h3>Monthly Leave Trend</h3>

                    <LineChart width={900} height={300} data={monthlyData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Legend />

                        <Line
                            dataKey="days"
                            name="Total Leaves"
                            stroke="#673AB7"
                            strokeWidth={3}
                        />
                    </LineChart>
                </div>


                {/* Employee */}
                <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                    <h3>Top Leave Takers</h3>

                    <BarChart width={900} height={300} data={employeeData}>
                        <Legend />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />

                        <Bar dataKey="days" name="Leave Days">
                            {employeeData.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>

                    </BarChart>
                </div>

            </div>
        </div>
    );
};

export default LeaveDashboard;