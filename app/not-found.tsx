export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(255,247,232)] text-gray-800 px-4">
      <h1 className="text-5xl font-extrabold mb-2">404</h1>
      <p className="text-lg mb-4 text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="mt-2 inline-flex items-center px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:opacity-90"
      >
        Back to Home Page
      </a>
    </div>
  );
}

