export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Neuro Exercises
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a sandbox environment for testing and development purposes. 
          The full application with database functionality is available in the production environment.
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Sandbox Features
          </h2>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Static content rendering</li>
            <li>• Component testing environment</li>
            <li>• No database connections</li>
            <li>• Safe for experimentation</li>
          </ul>
        </div>
        <div className="text-sm text-gray-500">
          Environment: Development Sandbox
        </div>
      </div>
    </div>
  );
} 