import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import api from "../api"
import "./DataView.css"

// Updated colors for better readability on dark backgrounds
const COLORS = [
  "#d69e2e", // Golden brown
  "#8b4513", // Saddle brown
  "#a0522d", // Sienna
  "#cd853f", // Peru
  "#daa520", // Goldenrod
  "#b8860b", // Dark goldenrod
  "#ffd700", // Gold
  "#f4a460", // Sandy brown
  "#deb887", // Burlywood
  "#d2b48c"  // Tan
];

interface DataViewProps {
  data: any[]
}

export default function DataView({ data }: DataViewProps) {
  const totalExpense = data.reduce((sum, row) => sum + row.expense, 0);
  const totalIncome = data.reduce((sum, row) => sum + row.income, 0);
  const [summedclassifications, setSummedClassifications] = useState<any[]>([]);

  const expenseData = data.filter(d => d.expense > 0);

  async function organizedData() {
    try {
      // Convert data to the format expected by backend
      const formattedData = data.map(row => [
        row.date,
        row.activity,
        row.expense,
        row.income,
        row.classification
      ]);

      const response = await api.post("/pivot-table", formattedData)
      setSummedClassifications(response.data)
    }
    catch (error) {
      console.error("Error summing classifications:", error);
      alert("Could not sum the classifications")
    }

  }

  useEffect(() => {
    if (data.length > 0) {
      organizedData()
    }
  }, [data])

  // Prepare data for pie charts
  const expenseChartData = summedclassifications
    .filter(item => item[1] > 0) // Only expense data
    .map(item => ({
      name: item[0],
      value: item[1]
    }));

  const incomeChartData = summedclassifications
    .filter(item => item[2] > 0) // Only income data
    .map(item => ({
      name: item[0],
      value: item[2]
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="data-view-container">
      {/* Left Charts Container */}
      <div className="charts-container">
        {/* Expense Pie Chart */}
        {expenseChartData.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Expense Breakdown</h3>
            <PieChart width={400} height={400}>
              <Pie
                data={expenseChartData}
                cx={200}
                cy={200}
                labelLine={false}
                label={({ name, percent, x, y }: any) => {
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#f7fafc"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fontWeight="600"
                      fontFamily="'Montserrat', sans-serif"
                      stroke="#1a202c"
                      strokeWidth="1"
                    >
                      {`${name} ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </div>
        )}

        {/* Income Pie Chart */}
        {incomeChartData.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Income Breakdown</h3>
            <PieChart width={400} height={400}>
              <Pie
                data={incomeChartData}
                cx={200}
                cy={200}
                labelLine={false}
                label={({ name, percent, x, y }: any) => {
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#f7fafc"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fontWeight="600"
                      fontFamily="'Montserrat', sans-serif"
                      stroke="#1a202c"
                      strokeWidth="1"
                    >
                      {`${name} ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </div>
        )}
      </div>

      {/* Right Table Container */}
      <div className="table-container">
        <h2 className="table-header">Classification Summary</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Classification</th>
                <th>Sum of Expense</th>
                <th>Sum of Income</th>
              </tr>
            </thead>
            <tbody>
              {summedclassifications.map((item, index) => (
                <tr key={index}>
                  <td>{item[0]}</td>
                  <td>{item[1].toFixed(2)}</td>
                  <td>{item[2].toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td>Grand Total</td>
                <td>{totalExpense.toFixed(2)}</td>
                <td>{totalIncome.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};







