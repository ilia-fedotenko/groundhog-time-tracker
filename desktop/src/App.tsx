function App() {
  return (
    <div className="w-full h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-2 select-none">
      <h1 className="text-sm font-semibold tracking-widest uppercase text-zinc-300">
        Groundhog
      </h1>
      <div className="w-full px-4">
        <div className="h-10 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-500">
          — timer placeholder —
        </div>
      </div>
    </div>
  );
}

export default App;
