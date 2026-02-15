export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-6 font-bold text-4xl text-gray-900">
          Welcome to Neuro Exercises
        </h1>
        <p className="mb-8 text-gray-600 text-lg">
          This is a sandbox environment for testing and development purposes.
          The full application with database functionality is available in the
          production environment.
        </p>
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 font-semibold text-2xl text-gray-800">
            Sandbox Features
          </h2>
          <ul className="space-y-2 text-left text-gray-600">
            <li>• Static content rendering</li>
            <li>• Component testing environment</li>
            <li>• No database connections</li>
            <li>• Safe for experimentation</li>
          </ul>
        </div>
        <div className="text-gray-500 text-sm">
          Environment: Development Sandbox
        </div>
        <pre>{JSON.stringify(process.env, null, 2)}</pre>
      </div>
    </div>
  );
}
