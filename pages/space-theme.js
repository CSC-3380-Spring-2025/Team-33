export default function SpaceTheme() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-6 relative overflow-hidden">
      {/* Optional: Stars background effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>

      <header className="relative text-center mb-10">
        <h1 className="text-4xl font-bold">PlanWise - Space Dim Theme 🚀</h1>
        <p className="text-purple-300 mt-2">Organize your tasks across the galaxy</p>
      </header>

      <section className="relative bg-gray-800 bg-opacity-70 p-6 rounded-lg shadow-lg max-w-2xl mx-auto backdrop-blur-md">
        <h2 className="text-xl font-semibold text-purple-400 mb-4">Today’s Missions</h2>
        <ul className="space-y-3">
          <li className="bg-indigo-800 bg-opacity-40 p-3 rounded">🪐 Review planner UI code</li>
          <li className="bg-indigo-800 bg-opacity-40 p-3 rounded">🌠 Add detailed calendar logic</li>
          <li className="bg-indigo-800 bg-opacity-40 p-3 rounded">🚀 Finalize icon designs</li>
        </ul>
      </section>

      <footer className="relative text-center mt-10 text-sm text-purple-300">
        Reach for the stars. Stay on track. Plan wise.
      </footer>
    </div>
  );
}
