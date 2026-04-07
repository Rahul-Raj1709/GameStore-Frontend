import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Placeholder Components (We will build these in the /features folder next)
const Navbar = () => (
  <nav className="p-4 border-b border-secondary flex gap-4">
    <Link to="/" className="text-xl font-bold text-primary">
      GameStore
    </Link>
    <Link to="/login" className="hover:text-primary transition-colors">
      Login
    </Link>
  </nav>
);

const Home = () => (
  <div className="p-8 text-center">
    <h1 className="text-4xl font-bold mb-4">Welcome to GameStore</h1>
    <p className="text-gray-400">The catalog is empty... for now.</p>
  </div>
);

const Login = () => (
  <div className="p-8 max-w-md mx-auto mt-20 bg-secondary rounded-lg">
    <h2 className="text-2xl font-bold mb-4">Login</h2>
    <p className="text-gray-400">Authentication form goes here.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
