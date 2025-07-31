import React, {useState} from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import api from "../api"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];

interface DataViewProps{
    data: any[]
}

export default function DataView({data}:DataViewProps) {
 const totalExpense = data.reduce((sum, row) => sum + row.expense, 0);
  const totalIncome = data.reduce((sum, row) => sum + row.income, 0);
  const [summedclassifications, setSummedClassifications] = useState<any[]>([]);

  const expenseData = data.filter(d => d.expense > 0);

  async function organizedData() {
    try{
        const response = await api.post("/pivot-table",{
          classifications: data
        })
        setSummedClassifications(response.data)
    }
    catch (error){
      alert("Could not sum the classifications")
    }
    
  }

  organizedData()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Classification</th>
              <th className="px-4 py-2 text-right">Sum of Expense</th>
              <th className="px-4 py-2 text-right">Sum of Income</th>
            </tr>
          </thead>
          <tbody>
            {summedclassifications.map((classification, amount) => (
              <tr key={amount} className="border-t">
                <td className="px-4 py-2">{classification}</td>
                <td className="px-4 py-2 text-right">
                  {amount}
                </td>
                <td className="px-4 py-2 text-right">
                  {classification.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="font-bold border-t">
              <td className="px-4 py-2">Grand Total</td>
              <td className="px-4 py-2 text-right">{totalExpense.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">{totalIncome.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};







