import React, { useState } from "react";

export const TimeSheetList = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: "",
    hours: "",
    description: "",
  });
  const [entries, setEntries] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEntries([...entries, form]);
    setForm({ date: "", hours: "", description: "" });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col">
      <button
        className="self-end mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setShowModal(true)}
      >
        Add Timesheet
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Finish Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.startTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.finishTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Timesheet Entry</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEntries([
                  ...entries,
                  {
                    date: form.date,
                    startTime: form.startTime,
                    finishTime: form.finishTime,
                    description: form.description,
                  },
                ]);
                setForm({
                  date: "",
                  startTime: "",
                  finishTime: "",
                  description: "",
                });
                setShowModal(false);
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col">
                <label
                  className="mb-1 font-medium text-gray-700"
                  htmlFor="date"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label
                  className="mb-1 font-medium text-gray-700"
                  htmlFor="startTime"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={form.startTime || ""}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  placeholder="Start Time"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label
                  className="mb-1 font-medium text-gray-700"
                  htmlFor="finishTime"
                >
                  Finish Time
                </label>
                <input
                  type="time"
                  id="finishTime"
                  name="finishTime"
                  value={form.finishTime || ""}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  placeholder="Finish Time"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label
                  className="mb-1 font-medium text-gray-700"
                  htmlFor="description"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  placeholder="Description"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
