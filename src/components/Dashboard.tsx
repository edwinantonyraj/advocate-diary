import React from "react";

export default function Dashboard() {
  return (
    <div className="space-y-5">

      <div className="rounded-3xl bg-blue-700 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold">
          Advocate Diary Pro
        </h2>

        <p className="mt-2 text-blue-100">
          Good Morning 👋
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-white p-5 shadow">
          <h3 className="text-sm text-gray-500">
            Today's Hearings
          </h3>

          <p className="text-3xl font-bold mt-2">
            12
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <h3 className="text-sm text-gray-500">
            Pending Cases
          </h3>

          <p className="text-3xl font-bold mt-2">
            148
          </p>
        </div>

      </div>

    </div>
  );
}
