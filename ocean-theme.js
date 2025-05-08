export default function OceanTheme() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 text-white p-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold">PlanWise - Ocean Dim Theme</h1>
        <p className="text-teal-300 mt-2">Welcome to your calming workspace</p>
      </header>

      <section className="bg-blue-900 bg-opacity-60 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-teal-300 mb-4">Today’s Plan</h2>
        <ul className="space-y-3">
          <li className="bg-blue-800 bg-opacity-30 p-3 rounded">• Review code for planner UI</li>
          <li className="bg-blue-800 bg-opacity-30 p-3 rounded">• Add detailed calendar logic</li>
          <li className="bg-blue-800 bg-opacity-30 p-3 rounded">• Finalize icon design</li>
        </ul>
      </section>

      <footer className="text-center mt-10 text-sm text-blue-300">
        Stay focused. Stay organized. Plan wise.
      </footer>
    </div>
  );
}
