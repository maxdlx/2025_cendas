import React from "react";

const PlanPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4 text-xl font-bold">
        Construction Tasks
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <img
          src="/image.png"
          alt="Floor Plan"
          className="max-w-full h-auto border rounded shadow mb-4"
        />
        {/* TODO: Add task board and plan markers */}
        <div className="w-full max-w-xl bg-white rounded shadow p-4">
          <h2 className="text-lg font-bold mb-2">Tasks</h2>
          {/* TODO: Render tasks list here */}
        </div>
      </main>
    </div>
  );
};

export default PlanPage;
