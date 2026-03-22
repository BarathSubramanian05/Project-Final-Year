import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";

import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, CartesianGrid, Legend
} from "recharts";
import axiosInstance from "../axiosConfig";

const ProductivityDashboard = () => {

    const [employeeHours, setEmployeeHours] = useState([]);
    const [dailyProductivity, setDailyProductivity] = useState([]);
    const [taskStatus, setTaskStatus] = useState([]);
    const [kpis, setKpis] = useState({
        avgHours: 0,
        maxDay: "",
        maxHours: 0,
        minDay: "",
        minHours: 0
    });

    const COLORS = [
        "#4CAF50",
        "#2196F3",
        "#FFC107",
        "#FF5722",
        "#9C27B0",
        "#E91E63"
    ];

    useEffect(() => {

        axiosInstance.get("workdetails/analytics/work-hours")
            .then(res => formatEmployeeHours(res.data));

        axiosInstance.get("workdetails/analytics/daily-productivity")
            .then(res => formatDaily(res.data));

        axiosInstance.get("workdetails/analytics/task-status")
            .then(res => formatStatus(res.data));

    }, []);

    const formatEmployeeHours = (data) => {
        setEmployeeHours(data.map(d => ({
            name: d.employeeName,
            hours: d.totalHours
        })));
    };

    const formatDaily = (data) => {

        const formatted = data.map(d => ({
            date: d.date,
            hours: d.hours
        }));

        setDailyProductivity(formatted);

        calculateKPIs(formatted);
    };

    const formatStatus = (data) => {
        setTaskStatus(data.map(d => ({
            name: d.status,
            value: d.count
        })));
    };

    const calculateKPIs = (data) => {

        if (data.length === 0) return;

        const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
        const avgHours = (totalHours / data.length).toFixed(2);

        const max = data.reduce((a, b) => a.hours > b.hours ? a : b);
        const min = data.reduce((a, b) => a.hours < b.hours ? a : b);

        setKpis({
            avgHours,
            maxDay: max.date,
            maxHours: max.hours,
            minDay: min.date,
            minHours: min.hours
        });
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
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
    };

    return (

        <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>

            <h2 style={{
                textAlign: "center",
                padding: "20px",
                fontSize: "28px"
            }}>
                ⏱️ Productivity Dashboard
            </h2>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                padding: "20px"
            }}>

                <div style={cardStyle}>
                    <h4>📊 Avg Daily Productivity</h4>
                    <h2>{kpis.avgHours} hrs</h2>
                </div>

                <div style={cardStyle}>
                    <h4>🚀 Highest Productivity</h4>
                    <p>{kpis.maxDay}</p>
                    <h2>{kpis.maxHours} hrs</h2>
                </div>

                <div style={cardStyle}>
                    <h4>📉 Lowest Productivity</h4>
                    <p>{kpis.minDay}</p>
                    <h2>{kpis.minHours} hrs</h2>
                </div>

            </div>

            <div style={containerStyle}>

                {/* Work Hours by Employee */}
                <div style={cardStyle}>
                    <h3>👨‍💻 Work Hours by Employee</h3>

                    <BarChart width={420} height={280} data={employeeHours}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />

                        <Bar dataKey="hours" name="Work Hours">
                            {employeeHours.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </div>


                {/* Task Status */}
                <div style={cardStyle}>
                    <h3>📉 Task Completion Status</h3>

                    <PieChart width={350} height={280}>
                        <Tooltip />
                        <Legend />

                        <Pie
                            data={taskStatus}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                        >
                            {taskStatus.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </div>


                {/* Daily Productivity */}
                <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                    <h3>📈 Daily Productivity Trend</h3>

                    <LineChart width={900} height={300} data={dailyProductivity}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="hours"
                            name="Total Work Hours"
                            stroke="#673AB7"
                            strokeWidth={3}
                        />
                    </LineChart>
                </div>

            </div>
        </div>
    );
};

export default ProductivityDashboard;