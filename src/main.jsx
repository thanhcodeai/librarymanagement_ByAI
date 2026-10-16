import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Search,
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  Library,
  ClipboardList,
  Users,
  User,
  LogOut,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Leaf,
  Menu,
  Pencil,
  Trash2,
  LoaderCircle,
  Mail,
  CalendarDays,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import "./style.css";
const labels = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  DENIED: "Từ chối",
};
const fmt = (d) =>
  d ? new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("vi-VN") : "—";
async function api(url, options = {}) {
  const r = await fetch("/api/v1" + url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (r.status === 204) return null;
  const data = await r.json();
  if (!r.ok) {
    if (r.status === 401 && !url.startsWith("/auth/"))
      window.dispatchEvent(new Event("session-expired"));
    const e = Error(data.error?.message || "Không thể kết nối.");
    e.status = r.status;
    e.details = data.error?.details;
    throw e;
  }
  return data.data;
}
function Badge({ status }) {
  return (
    <span className={"badge " + status.toLowerCase()}>
      <i />
      {labels[status]}
    </span>
  );
}
const palettes = [
  ["#163e36", "#e5d6b5"],
  ["#b64c37", "#f3d9ae"],
  ["#d9b273", "#283c37"],
  ["#344b66", "#f3ddb7"],
  ["#789080", "#fcf3db"],
  ["#dfcbbb", "#554b41"],
];
function Cover({ book, large = false }) {
  const n = (book.id - 1) % palettes.length,
    [bg, fg] = palettes[n];
  return (
    <div
      className={"cover " + (large ? "large" : "")}
      style={{ "--cover": bg, "--ink": fg }}
    >
      <div className="book-spine" />
      <div className="cover-top">
        LÁ THƯ VIỆN <span>✦</span>
      </div>
      <div className={"cover-art art-" + n}>
        <span />
        <span />
        <span />
      </div>
      <div className="cover-title">{book.title}</div>
      <div className="cover-author">{book.author}</div>
      <div className="cover-bottom">
        TỦ SÁCH CHỌN LỌC <span>✧</span>
      </div>
    </div>
  );
}
function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Modal({ title, subtitle, onClose, children, wide = false }) {
  const box = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const focusable = () => [
      ...box.current.querySelectorAll(
        'button:not(:disabled),input,select,textarea,[tabindex="0"]',
      ),
    ];
    focusable()[0]?.focus();
    const f = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = focusable(),
          first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", f);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", f);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={box}
        className={"modal " + (wide ? "wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button className="icon close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
        {children}
      </section>
    </div>
  );
}
function App() {
  const [user, setUser] = useState(null),
    [boot, setBoot] = useState(true),
    [view, setView] = useState("books"),
    [authMode, setAuthMode] = useState("login"),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(null),
    [revision, setRevision] = useState(0),
    [menu, setMenu] = useState(false);
  useEffect(() => {
    const expire = () => {
      setUser(null);
      setModal(null);
    };
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  const refresh = () => setRevision((x) => x + 1);
  function notify(message, error = false) {
    setToast({ message, error });
    setTimeout(() => setToast(null), 5000);
  }
  useEffect(() => {
    api("/me")
      .then(setUser)
      .catch(() => {})
      .finally(() => setBoot(false));
  }, []);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      setView("books");
    } catch (e) {
      notify(e.message, true);
    }
  }
  const admin = user?.role === "ADMIN";
  const nav = admin
    ? [
        ["dashboard", "Tổng quan", LayoutDashboard],
        ["manage-books", "Quản lý sách", Library],
        ["requests", "Yêu cầu mượn", ClipboardList],
        ["users", "Người dùng", Users],
        ["books", "Khám phá sách", BookOpen],
      ]
    : [
        ["books", "Khám phá sách", Library],
        ["history", "Sách của tôi", BookOpen],
        ["profile", "Hồ sơ cá nhân", User],
      ];
  if (boot)
    return (
      <div className="boot">
        <Leaf size={36} />
        <p>Đang mở thư viện…</p>
      </div>
    );
  if (!user)
    return (
      <div className="auth-page">
        <div className="auth-story">
          <a className="brand">
            <span className="brand-icon">
              <Leaf />
            </span>
            Lá<span className="brand-sub">THƯ VIỆN</span>
          </a>
          <div>
            <span className="eyebrow">MỖI TRANG SÁCH, MỘT CHÂN TRỜI</span>
            <h1>
              Đọc một cuốn sách.
              <br />
              Mở một thế giới.
            </h1>
            <p>
              Nơi những câu chuyện bắt đầu, tri thức được sẻ chia
              <br />
              và cảm hứng luôn ở lại.
            </p>
            <div className="auth-books">
              {[
                { id: 1, title: "Nhà giả kim", author: "Paulo Coelho" },
                { id: 2, title: "Rừng Na Uy", author: "Haruki Murakami" },
                {
                  id: 4,
                  title: "Lược sử loài người",
                  author: "Yuval Noah Harari",
                },
              ].map((b) => (
                <Cover key={b.id} book={b} />
              ))}
            </div>
          </div>
          <small>KHÔNG GIAN TRI THỨC CỦA BẠN</small>
        </div>
        <div className="auth-panel">
          <div className="auth-form">
            <span className="pill">
              <Leaf size={14} /> Chào mừng đến với Lá
            </span>
            <h2>
              {authMode === "login"
                ? "Thật vui khi gặp lại bạn."
                : "Bắt đầu hành trình đọc."}
            </h2>
            <p className="muted">
              {authMode === "login"
                ? "Đăng nhập để khám phá và mượn những cuốn sách bạn yêu thích."
                : "Tạo tài khoản độc giả để khám phá kho sách của thư viện."}
            </p>
            <AuthForm
              mode={authMode}
              onSuccess={(u) => {
                if (u) {
                  setUser(u);
                  setView(u.role === "ADMIN" ? "dashboard" : "books");
                } else {
                  setAuthMode("login");
                  notify("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
                }
              }}
            />
            <p className="auth-switch">
              {authMode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                {authMode === "login" ? "Đăng ký độc giả" : "Đăng nhập"}
              </button>
            </p>
            <div className="auth-security">
              <ShieldCheck size={16} /> Thông tin của bạn được bảo vệ an toàn
            </div>
          </div>
          <small>
            © {new Date().getFullYear()} Lá Thư Viện. Nuôi dưỡng thói quen đọc.
          </small>
        </div>
        {toast && <Toast toast={toast} />}
      </div>
    );
  return (
    <div className="app">
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <a className="brand" href="#" onClick={(e) => e.preventDefault()}>
          <span className="brand-icon">
            <Leaf />
          </span>
          Lá<span className="brand-sub">THƯ VIỆN</span>
        </a>
        <div className="nav-caption">
          {admin ? "KHÔNG GIAN QUẢN TRỊ" : "KHÔNG GIAN CỦA BẠN"}
        </div>
        <nav>
          {nav.map(([key, label, Icon]) => (
            <button
              className={view === key ? "active" : ""}
              key={key}
              onClick={() => {
                setView(key);
                setMenu(false);
              }}
            >
              <Icon size={20} />
              {label}
              {view === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span>✦</span>
          <p>
            “Một cuốn sách hay là
            <br />
            một người bạn tốt.”
          </p>
          <small>Hãy đọc một chút mỗi ngày.</small>
          <BookOpen size={37} />
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setView("profile")}>
            <div className="avatar">{user.fullName.slice(0, 1)}</div>
            <span>
              <b>{user.fullName}</b>
              <small>{admin ? "Quản trị viên" : "Thành viên thư viện"}</small>
            </span>
          </button>
          <button
            className="icon"
            onClick={logout}
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-label="Mở menu"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Thư viện <span>/</span>{" "}
            <b>{nav.find((n) => n[0] === view)?.[1] || "Hồ sơ cá nhân"}</b>
          </div>
          <div className="topbar-right">
            <span className="today">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="top-divider" />
            <button
              className="avatar small"
              onClick={() => setView("profile")}
              aria-label="Hồ sơ"
            >
              {user.fullName.slice(0, 1)}
            </button>
          </div>
        </header>
        <main>
          {view === "books" || view === "manage-books" ? (
            <Catalog
              key={view}
              user={user}
              manage={view === "manage-books"}
              revision={revision}
              notify={notify}
              open={setModal}
            />
          ) : view === "history" || view === "requests" ? (
            <Requests
              admin={view === "requests"}
              revision={revision}
              notify={notify}
              open={setModal}
            />
          ) : view === "dashboard" ? (
            <Dashboard revision={revision} navigate={setView} notify={notify} />
          ) : view === "users" ? (
            <UserList revision={revision} open={setModal} notify={notify} />
          ) : (
            <Profile user={user} />
          )}
        </main>
        <footer>
          <span>
            <Leaf size={13} /> Lá Thư Viện
          </span>
          <span>Một không gian nhỏ. Ngàn chân trời mới.</span>
        </footer>
      </div>
      {modal?.type === "detail" && (
        <BookDetail
          book={modal.book}
          user={user}
          onClose={() => setModal(null)}
          borrow={() => setModal({ type: "borrow", book: modal.book })}
        />
      )}{" "}
      {modal?.type === "borrow" && (
        <BorrowForm
          book={modal.book}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            notify("Đã gửi yêu cầu mượn. Thư viện sẽ xét duyệt sớm.");
            refresh();
          }}
        />
      )}
      {modal?.type === "book-form" && (
        <BookForm
          book={modal.book}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            notify("Đã lưu thông tin sách.");
            refresh();
          }}
        />
      )}
      {modal?.type === "user-form" && (
        <UserForm
          user={modal.user}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            notify("Đã lưu người dùng.");
            refresh();
          }}
        />
      )}
      {modal?.type === "decision" && (
        <DecisionForm
          item={modal.item}
          decision={modal.decision}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            notify("Đã xử lý yêu cầu mượn.");
            refresh();
          }}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteDialog
          modal={modal}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            notify("Đã xóa dữ liệu.");
            refresh();
          }}
        />
      )}
      {toast && <Toast toast={toast} />}
    </div>
  );
}
function Toast({ toast }) {
  return (
    <div className={"toast " + (toast.error ? "error" : "")} role="status">
      {toast.error ? <XCircle size={19} /> : <CheckCircle2 size={19} />}{" "}
      {toast.message}
    </div>
  );
}
function AuthForm({ mode, onSuccess }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const d = Object.fromEntries(new FormData(e.target));
    try {
      const data = await api(
        "/auth/" + (mode === "login" ? "login" : "register"),
        { method: "POST", body: JSON.stringify(d) },
      );
      onSuccess(mode === "login" ? data.user : null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form key={mode} onSubmit={submit}>
      {mode === "register" && (
        <Field label="Họ và tên">
          <input
            name="fullName"
            placeholder="Nguyễn An"
            required
            maxLength={150}
            autoComplete="name"
          />
        </Field>
      )}
      <Field label="Tên đăng nhập">
        <input
          name="username"
          placeholder="Nhập tên đăng nhập"
          required
          maxLength={64}
          autoComplete="username"
          pattern={mode === "register" ? "[a-zA-Z0-9_.\\-]+" : undefined}
        />
      </Field>
      {mode === "register" && (
        <Field label="Email (tùy chọn)">
          <input
            type="email"
            name="email"
            placeholder="ban@example.com"
            autoComplete="email"
          />
        </Field>
      )}
      <Field
        label="Mật khẩu"
        hint={mode === "register" ? "Tối thiểu 8 ký tự." : null}
      >
        <div className="password-wrap">
          <input
            name="password"
            type={show ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            required
            minLength={mode === "register" ? 8 : 1}
            maxLength={128}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          <button
            type="button"
            className="icon"
            onClick={() => setShow(!show)}
            aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn primary full" disabled={busy}>
        {busy ? <LoaderCircle className="spin" size={18} /> : null}
        {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
function useData(url, revision) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    api(url)
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [url, revision]);
  return { data, error, loading };
}
function State({ loading, error, empty = false }) {
  return (
    <div className="state">
      {loading ? (
        <>
          <LoaderCircle className="spin" />
          <h3>Đang tải dữ liệu…</h3>
        </>
      ) : error ? (
        <>
          <XCircle />
          <h3>Chưa tải được dữ liệu</h3>
          <p>{error}</p>
        </>
      ) : empty ? (
        <>
          <BookOpen />
          <h3>Chưa có kết quả</h3>
          <p>Hãy thử từ khóa khác hoặc thay đổi bộ lọc.</p>
        </>
      ) : null}
    </div>
  );
}
function Pagination({ data, onPage }) {
  if (!data || data.totalPages <= 1) return null;
  return (
    <div className="pagination">
      <span>
        Trang {data.page} / {data.totalPages} · {data.total} kết quả
      </span>
      <div>
        <button
          className="btn"
          disabled={data.page === 1}
          onClick={() => onPage(data.page - 1)}
        >
          <ChevronLeft size={16} />
          Trước
        </button>
        <button
          className="btn"
          disabled={data.page >= data.totalPages}
          onClick={() => onPage(data.page + 1)}
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
function Catalog({ user, manage, revision, open }) {
  const [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [sort, setSort] = useState("newest"),
    [page, setPage] = useState(1);
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  const params = new URLSearchParams({
    q: search,
    category,
    sort,
    page,
    pageSize: 12,
  });
  const { data, error, loading } = useData(
    (manage ? "/admin/books" : "/books") + "?" + params,
    revision,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {manage ? "QUẢN LÝ THƯ VIỆN" : "DÀNH CHO NHỮNG TÂM HỒN HAM ĐỌC"}
          </span>
          <h1>
            {manage ? "Quản lý sách" : "Khám phá sách"}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            {manage
              ? "Chăm chút từng đầu sách trong kho tri thức của bạn."
              : "Tìm cuốn sách tiếp theo, bắt đầu hành trình mới."}
          </p>
        </div>
        {manage ? (
          <button
            className="btn primary"
            onClick={() => open({ type: "book-form" })}
          >
            <Plus size={18} />
            Thêm sách mới
          </button>
        ) : (
          <span className="quiet-label">
            <span className="live-dot" />
            Thư viện luôn ở đây, dành cho bạn
          </span>
        )}
      </div>
      {!manage && (
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">
              <span />
              GÓC CẢM HỨNG
            </span>
            <h2>
              Mỗi cuốn sách,
              <br />
              một thế giới chờ bạn.
            </h2>
            <p>
              Chậm lại một chút. Mở một trang sách.
              <br />
              Và để những điều mới mẻ tìm đến bạn.
            </p>
            <button
              className="hero-link"
              onClick={() => document.getElementById("catalog-search").focus()}
            >
              Tìm cuốn sách của bạn <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="star s1">✦</span>
            <span className="star s2">✧</span>
            <div className="hero-book back">
              <span>
                THE ART
                <br />
                OF
                <br />
                READING
              </span>
              <i>mỗi ngày một trang</i>
            </div>
            <div className="hero-book front">
              <span className="hb-small">MỞ SÁCH · MỞ LÒNG</span>
              <BookOpen />
              <b>
                Những
                <br />
                chân trời
                <br />
                <em>mới.</em>
              </b>
              <span className="hb-bottom">LÁ THƯ VIỆN — COLLECTION</span>
            </div>
            <div className="floating-note">
              <BookOpen size={19} />
              <span>
                Một thói quen nhỏ
                <br />
                <b>Một thay đổi lớn</b>
              </span>
            </div>
          </div>
        </section>
      )}
      <section className="catalog-section">
        <div className="section-title">
          <h2>
            {manage ? "Danh mục sách" : "Tủ sách dành cho bạn"}{" "}
            <span>{data?.total ?? "—"} đầu sách</span>
          </h2>
          {!manage && (
            <span className="muted small-text">
              Chọn một cuốn sách, mang về một ý tưởng.
            </span>
          )}
        </div>
        <div className="filters">
          <div className="search">
            <Search size={19} />
            <input
              id="catalog-search"
              aria-label="Tìm sách"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên sách, tác giả hoặc mã sách…"
            />
            {q && (
              <button
                className="icon"
                onClick={() => setQ("")}
                aria-label="Xóa từ khóa"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <label className="select-wrap">
            <SlidersHorizontal size={16} />
            <select
              aria-label="Thể loại"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả thể loại</option>
              {data?.categories?.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <select
            className="sort"
            aria-label="Sắp xếp"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Mới cập nhật</option>
            <option value="title">Tên sách A → Z</option>
            <option value="available">Còn nhiều nhất</option>
          </select>
        </div>
        {loading || error ? (
          <State loading={loading} error={error} />
        ) : !data?.items.length ? (
          <State empty />
        ) : manage ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Đầu sách</th>
                  <th>Thể loại</th>
                  <th>Tổng số</th>
                  <th>Có sẵn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b>{b.title}</b>
                      <small>
                        {b.bookCode} · {b.author}
                      </small>
                    </td>
                    <td>{b.category || "—"}</td>
                    <td>{b.totalQuantity}</td>
                    <td>
                      <span className="stock">{b.availableQuantity}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon"
                          aria-label={"Sửa " + b.title}
                          onClick={() => open({ type: "book-form", book: b })}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="icon danger"
                          aria-label={"Xóa " + b.title}
                          onClick={() =>
                            open({
                              type: "delete",
                              resource: "books",
                              id: b.id,
                              name: b.title,
                            })
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="book-grid">
            {data.items.map((b) => (
              <article className="book-card" key={b.id}>
                <button
                  className="cover-area"
                  onClick={() => open({ type: "detail", book: b })}
                  aria-label={"Xem " + b.title}
                >
                  <Cover book={b} />
                  <span
                    className={
                      "availability " + (b.availableQuantity ? "" : "out")
                    }
                  >
                    {b.availableQuantity ? (
                      <>
                        <span />
                        Còn {b.availableQuantity} cuốn
                      </>
                    ) : (
                      "Hết sách"
                    )}
                  </span>
                  <span className="cover-open">
                    <ArrowUpRight size={20} />
                  </span>
                </button>
                <div className="book-info">
                  <span className="category">
                    {b.category || "Chưa phân loại"}
                  </span>
                  <button
                    className="book-name"
                    onClick={() => open({ type: "detail", book: b })}
                  >
                    {b.title}
                  </button>
                  <p>{b.author}</p>
                  <div className="book-card-bottom">
                    <small>{b.bookCode}</small>
                    <button
                      onClick={() =>
                        open({
                          type: user.role === "USER" ? "borrow" : "detail",
                          book: b,
                        })
                      }
                    >
                      {user.role === "USER" ? "Mượn sách" : "Chi tiết"}
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination data={data} onPage={setPage} />
      </section>
    </>
  );
}
function BookDetail({ book, user, onClose, borrow }) {
  return (
    <Modal title="Chi tiết sách" onClose={onClose} wide>
      <div className="book-detail">
        <Cover book={book} large />
        <div>
          <span className="category">{book.category}</span>
          <h2>{book.title}</h2>
          <p className="muted">{book.author}</p>
          <dl>
            <div>
              <dt>Mã sách</dt>
              <dd>{book.bookCode}</dd>
            </div>
            <div>
              <dt>Số lượng có sẵn</dt>
              <dd>
                {book.availableQuantity} / {book.totalQuantity} cuốn
              </dd>
            </div>
          </dl>
          <p className="description">
            {book.description || "Chưa có mô tả cho đầu sách này."}
          </p>
          {user.role === "USER" && (
            <button className="btn primary" onClick={borrow}>
              Gửi yêu cầu mượn
              <ArrowRight size={17} />
            </button>
          )}
          <p className="small-text muted">
            Yêu cầu được thư viện xét duyệt theo số lượng sách tại thời điểm
            duyệt.
          </p>
        </div>
      </div>
    </Modal>
  );
}
function BorrowForm({ book, onClose, onDone }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = Object.fromEntries(new FormData(e.target));
    try {
      await api("/borrow-requests", {
        method: "POST",
        body: JSON.stringify({ ...d, bookId: book.id }),
      });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Gửi yêu cầu mượn"
      subtitle="Một cuốn sách mới đang chờ bạn khám phá."
      onClose={onClose}
    >
      <div className="borrow-summary">
        <BookOpen />
        <div>
          <b>{book.title}</b>
          <small>
            {book.author} · {book.bookCode}
          </small>
        </div>
      </div>
      <form onSubmit={submit}>
        <div className="form-row">
          <Field label="Ngày mượn">
            <input
              type="date"
              name="borrowDate"
              defaultValue={today}
              required
            />
          </Field>
          <Field label="Ngày trả dự kiến">
            <input type="date" name="dueDate" required />
          </Field>
        </div>
        <p className="notice">
          <Clock size={18} />
          Gửi yêu cầu chưa giữ chỗ hoặc giảm tồn sách. Thư viện sẽ xác nhận khi
          duyệt yêu cầu.
        </p>
        <FormBottom
          error={error}
          busy={busy}
          onClose={onClose}
          label="Gửi yêu cầu"
        />
      </form>
    </Modal>
  );
}
function FormBottom({ error, busy, onClose, label = "Lưu thay đổi" }) {
  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-bottom">
        <button type="button" className="btn" onClick={onClose}>
          Hủy
        </button>
        <button className="btn primary" disabled={busy}>
          {busy && <LoaderCircle className="spin" size={16} />} {label}
        </button>
      </div>
    </>
  );
}
function BookForm({ book, onClose, onDone }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = Object.fromEntries(new FormData(e.target));
    d.totalQuantity = Number(d.totalQuantity);
    try {
      await api("/admin/books" + (book ? "/" + book.id : ""), {
        method: book ? "PUT" : "POST",
        body: JSON.stringify(d),
      });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={book ? "Chỉnh sửa đầu sách" : "Thêm sách mới"}
      subtitle="Thông tin rõ ràng giúp độc giả dễ dàng tìm thấy sách."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="form-row">
          <Field label="Mã sách">
            <input
              name="bookCode"
              defaultValue={book?.bookCode}
              required
              maxLength={50}
            />
          </Field>
          <Field label="Tổng số cuốn">
            <input
              name="totalQuantity"
              type="number"
              min="0"
              max="1000000"
              defaultValue={book?.totalQuantity ?? 1}
              required
            />
          </Field>
        </div>
        <Field label="Tên sách">
          <input
            name="title"
            defaultValue={book?.title}
            required
            maxLength={255}
          />
        </Field>
        <Field label="Tác giả">
          <input
            name="author"
            defaultValue={book?.author}
            required
            maxLength={255}
          />
        </Field>
        <Field label="Thể loại">
          <input
            name="category"
            defaultValue={book?.category}
            maxLength={100}
            placeholder="Ví dụ: Văn học"
          />
        </Field>
        <Field label="Giới thiệu">
          <textarea
            name="description"
            defaultValue={book?.description}
            maxLength={10000}
            rows="3"
          />
        </Field>
        <p className="small-text muted">
          Số lượng có sẵn được hệ thống tính từ tổng số và số cuốn đã được duyệt
          mượn.
        </p>
        <FormBottom {...{ error, busy, onClose }} />
      </form>
    </Modal>
  );
}
function Requests({ admin, revision, open }) {
  const [status, setStatus] = useState(""),
    [page, setPage] = useState(1);
  const { data, error, loading } = useData(
    (admin ? "/admin/borrow-requests" : "/me/borrow-requests") +
      "?" +
      new URLSearchParams({ status, page, pageSize: 10 }),
    revision,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {admin ? "KẾT NỐI SÁCH VỚI ĐỘC GIẢ" : "HÀNH TRÌNH ĐỌC CỦA BẠN"}
          </span>
          <h1>
            {admin ? "Yêu cầu mượn sách" : "Sách của tôi"}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            {admin
              ? "Xem xét và phản hồi từng yêu cầu mượn sách."
              : "Theo dõi yêu cầu và những cuốn sách đã đồng hành cùng bạn."}
          </p>
        </div>
      </div>
      <section className="panel">
        <div className="tabs">
          {[["", "Tất cả"], ...Object.entries(labels)].map(([k, l]) => (
            <button
              key={k}
              className={status === k ? "selected" : ""}
              onClick={() => {
                setStatus(k);
                setPage(1);
              }}
            >
              {l}
            </button>
          ))}
        </div>
        {loading || error ? (
          <State loading={loading} error={error} />
        ) : !data?.items.length ? (
          <State empty />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sách{admin ? " / Độc giả" : ""}</th>
                  <th>Ngày mượn</th>
                  <th>Trả dự kiến</th>
                  <th>Trạng thái</th>
                  <th>{admin ? "Xét duyệt" : "Ghi chú thư viện"}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.book.title}</b>
                      <small>
                        {admin
                          ? r.user.fullName + " · @" + r.user.username
                          : r.book.bookCode}{" "}
                        · #{r.id}
                      </small>
                    </td>
                    <td>{fmt(r.borrowDate)}</td>
                    <td>{fmt(r.dueDate)}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                    <td>
                      {admin && r.status === "PENDING" ? (
                        <div className="actions">
                          <button
                            className="btn approve"
                            onClick={() =>
                              open({
                                type: "decision",
                                item: r,
                                decision: "APPROVE",
                              })
                            }
                          >
                            <Check size={15} />
                            Duyệt
                          </button>
                          <button
                            className="btn reject"
                            onClick={() =>
                              open({
                                type: "decision",
                                item: r,
                                decision: "DENY",
                              })
                            }
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="decision-note">
                          {r.decisionNote || "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination data={data} onPage={setPage} />
      </section>
      {!admin && (
        <p className="muted small-text history-note">
          <Clock size={16} /> Chức năng trả sách và gia hạn chưa nằm trong phạm
          vi hiện tại.
        </p>
      )}
    </>
  );
}
function DecisionForm({ item, decision, onClose, onDone }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/admin/borrow-requests/" + item.id, {
        method: "PATCH",
        body: JSON.stringify({
          decision,
          note: new FormData(e.target).get("note"),
        }),
      });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={decision === "APPROVE" ? "Duyệt yêu cầu mượn" : "Từ chối yêu cầu"}
      subtitle={"Yêu cầu #" + item.id + " · " + item.user.fullName}
      onClose={onClose}
    >
      <div className="borrow-summary">
        <BookOpen />
        <div>
          <b>{item.book.title}</b>
          <small>
            {fmt(item.borrowDate)} → {fmt(item.dueDate)}
          </small>
        </div>
      </div>
      <form onSubmit={submit}>
        <Field label="Ghi chú cho độc giả (tùy chọn)">
          <textarea
            name="note"
            rows="3"
            maxLength={500}
            placeholder="Nhập lời nhắn của thư viện…"
          />
        </Field>
        <p className="notice">
          {decision === "APPROVE"
            ? "Duyệt sẽ giảm một cuốn có sẵn. Yêu cầu đã xử lý không thể thay đổi lần hai."
            : "Từ chối không làm thay đổi số lượng sách. Quyết định này không thể đảo ngược."}
        </p>
        <FormBottom {...{ error, busy, onClose }} label="Xác nhận" />
      </form>
    </Modal>
  );
}
function Dashboard({ revision, navigate }) {
  const { data, error, loading } = useData("/admin/stats", revision);
  const recent = useData(
    "/admin/borrow-requests?status=PENDING&pageSize=5",
    revision,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            MỖI NGÀY, MỘT CHÚT TRI THỨC ĐƯỢC SẺ CHIA
          </span>
          <h1>
            Tổng quan thư viện<span className="heading-dot">.</span>
          </h1>
          <p>Chào bạn, cùng chăm sóc không gian đọc hôm nay.</p>
        </div>
        <button
          className="btn primary"
          onClick={() => navigate("manage-books")}
        >
          <Library size={17} />
          Quản lý kho sách
        </button>
      </div>
      {loading || error ? (
        <State loading={loading} error={error} />
      ) : (
        <>
          <div className="stats-grid">
            {[
              [
                Library,
                "Đầu sách",
                data.totalBooks,
                "Tổng cộng " + data.totalCopies + " cuốn",
              ],
              [Users, "Độc giả", data.totalUsers, "Thành viên thư viện"],
              [Clock, "Chờ duyệt", data.pending, "Yêu cầu cần bạn xem xét"],
              [
                CheckCircle2,
                "Đã duyệt",
                data.approved,
                "Cuốn sách được trao đi",
              ],
            ].map(([Icon, label, value, hint]) => (
              <div className="stat-card" key={label}>
                <span className="stat-icon">
                  <Icon size={21} />
                </span>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{hint}</small>
              </div>
            ))}
          </div>
          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-title">
                <h2>Yêu cầu chờ duyệt</h2>
                <button
                  className="text-button"
                  onClick={() => navigate("requests")}
                >
                  Xem tất cả
                  <ArrowUpRight size={16} />
                </button>
              </div>
              {recent.loading || recent.error ? (
                <State loading={recent.loading} error={recent.error} />
              ) : !recent.data?.items.length ? (
                <div className="state">
                  <CheckCircle2 />
                  <h3>Bạn đã xem hết yêu cầu</h3>
                  <p>Yêu cầu mới sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                recent.data.items.map((r) => (
                  <div className="recent-row" key={r.id}>
                    <div className="mini-book">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <b>{r.book.title}</b>
                      <small>
                        {r.user.fullName} · {fmt(r.borrowDate)}
                      </small>
                    </div>
                    <Badge status={r.status} />
                  </div>
                ))
              )}
            </section>
            <section className="dashboard-note">
              <span className="eyebrow">NHỊP ĐỌC CỦA THƯ VIỆN</span>
              <h2>
                Tri thức lớn lên
                <br />
                khi được sẻ chia.
              </h2>
              <BookOpen size={66} />
              <dl>
                <div>
                  <dt>Sách có sẵn</dt>
                  <dd>{data.availableCopies} cuốn</dd>
                </div>
                <div>
                  <dt>Tổng yêu cầu</dt>
                  <dd>{data.totalRequests}</dd>
                </div>
                <div>
                  <dt>Đã từ chối</dt>
                  <dd>{data.denied}</dd>
                </div>
              </dl>
            </section>
          </div>
        </>
      )}
    </>
  );
}
function UserList({ revision, open }) {
  const [q, setQ] = useState(""),
    [page, setPage] = useState(1);
  const { data, error, loading } = useData(
    "/admin/users?" + new URLSearchParams({ q, page, pageSize: 10 }),
    revision,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CỘNG ĐỒNG YÊU SÁCH</span>
          <h1>
            Quản lý người dùng<span className="heading-dot">.</span>
          </h1>
          <p>Thông tin thành viên và quyền truy cập thư viện.</p>
        </div>
        <button
          className="btn primary"
          onClick={() => open({ type: "user-form" })}
        >
          <Plus size={18} />
          Thêm người dùng
        </button>
      </div>
      <section className="panel">
        <div className="search user-search">
          <Search size={18} />
          <input
            aria-label="Tìm người dùng"
            placeholder="Tìm tên hoặc tên đăng nhập…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {loading || error ? (
          <State loading={loading} error={error} />
        ) : !data?.items.length ? (
          <State empty />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Tham gia</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{u.fullName.slice(0, 1)}</div>
                        <div>
                          <b>{u.fullName}</b>
                          <small>@{u.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>{u.email || "—"}</td>
                    <td>
                      <span className={"role " + u.role.toLowerCase()}>
                        {u.role === "ADMIN" ? "Quản trị viên" : "Độc giả"}
                      </span>
                    </td>
                    <td>{fmt(u.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon"
                          aria-label={"Sửa " + u.username}
                          onClick={() => open({ type: "user-form", user: u })}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="icon danger"
                          aria-label={"Xóa " + u.username}
                          onClick={() =>
                            open({
                              type: "delete",
                              resource: "users",
                              id: u.id,
                              name: u.fullName,
                            })
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination data={data} onPage={setPage} />
      </section>
    </>
  );
}
function UserForm({ user, onClose, onDone }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = Object.fromEntries(new FormData(e.target));
    if (user && !d.password) delete d.password;
    try {
      await api("/admin/users" + (user ? "/" + user.id : ""), {
        method: user ? "PUT" : "POST",
        body: JSON.stringify(d),
      });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={user ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <Field label="Họ và tên">
          <input
            name="fullName"
            defaultValue={user?.fullName}
            required
            maxLength={150}
          />
        </Field>
        <Field label="Tên đăng nhập">
          <input
            name="username"
            defaultValue={user?.username}
            required
            pattern="[a-zA-Z0-9_.\-]+"
            maxLength={64}
          />
        </Field>
        <Field label="Email (tùy chọn)">
          <input type="email" name="email" defaultValue={user?.email || ""} />
        </Field>
        <Field
          label={user ? "Mật khẩu mới (bỏ trống để giữ nguyên)" : "Mật khẩu"}
        >
          <input
            name="password"
            type="password"
            minLength={8}
            maxLength={128}
            required={!user}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Vai trò">
          <select name="role" defaultValue={user?.role || "USER"}>
            <option value="USER">Độc giả</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </Field>
        <FormBottom {...{ error, busy, onClose }} />
      </form>
    </Modal>
  );
}
function DeleteDialog({ modal, onClose, onDone }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <Modal title="Xác nhận xóa" onClose={onClose}>
      <p>
        Bạn muốn xóa <b>{modal.name}</b>?
      </p>
      <p className="muted">
        Thao tác không thể hoàn tác. Dữ liệu có lịch sử mượn sẽ được giữ lại và
        không thể xóa.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("/admin/" + modal.resource + "/" + modal.id, {
              method: "DELETE",
            });
            onDone();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <FormBottom {...{ error, busy, onClose }} label="Xác nhận xóa" />
      </form>
    </Modal>
  );
}
function Profile({ user }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THÔNG TIN THÀNH VIÊN</span>
          <h1>
            Hồ sơ cá nhân<span className="heading-dot">.</span>
          </h1>
          <p>Một góc nhỏ dành riêng cho bạn.</p>
        </div>
      </div>
      <section className="profile panel">
        <div className="profile-banner">
          <Leaf size={70} />
        </div>
        <div className="profile-body">
          <div className="avatar profile-avatar">
            {user.fullName.slice(0, 1)}
          </div>
          <h2>{user.fullName}</h2>
          <span className="role">
            {user.role === "ADMIN" ? "Quản trị viên" : "Độc giả thư viện"}
          </span>
          <dl>
            <div>
              <dt>
                <User size={17} />
                Tên đăng nhập
              </dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt>
                <Mail size={17} />
                Email
              </dt>
              <dd>{user.email || "Chưa cung cấp"}</dd>
            </div>
            <div>
              <dt>
                <CalendarDays size={17} />
                Ngày tham gia
              </dt>
              <dd>{fmt(user.createdAt)}</dd>
            </div>
            <div>
              <dt>
                <ShieldCheck size={17} />
                Mã thành viên
              </dt>
              <dd>TV-{String(user.id).padStart(5, "0")}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
