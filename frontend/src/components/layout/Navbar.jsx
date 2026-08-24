function Navbar({ onMenuClick, darkMode, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="lg:hidden">
          <p className="font-semibold text-slate-900 dark:text-white">
            PayTrack
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          <span>{darkMode ? "☀️" : "🌙"}</span>
          <span className="hidden sm:inline">
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>

        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white sm:flex dark:bg-white dark:text-slate-900">
          S
        </div>
      </div>
    </header>
  );
}

export default Navbar;