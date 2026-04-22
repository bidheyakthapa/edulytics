import { useState } from "react";
import TopicBar from "./TopicBar.jsx";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PAGE_SIZE = 3;

export default function TopicList({ topics }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  if (topics.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
        No mastery data yet for this semester.
      </div>
    );
  }

  const filtered = topics.filter((t) =>
    t.topic_name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div>
      <div
        className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200
                      bg-white px-3 py-2 w-full sm:w-64"
      >
        <FiSearch className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search topic..."
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="mt-3 space-y-3">
        {paginated.length === 0 ? (
          <div
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5
                          text-sm text-slate-500"
          >
            No topics match your search.
          </div>
        ) : (
          paginated.map((topic) => (
            <TopicBar key={topic.topic_id} topic={topic} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>
            {filtered.length} topic{filtered.length !== 1 ? "s" : ""}
            {search ? ` matching "${search}"` : ""}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 p-1.5 hover:bg-slate-50
                         disabled:opacity-40 cursor-pointer"
              type="button"
            >
              <FiChevronLeft />
            </button>

            <span className="text-xs">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 p-1.5 hover:bg-slate-50
                         disabled:opacity-40 cursor-pointer"
              type="button"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
