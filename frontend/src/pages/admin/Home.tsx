const Home = () => {
  return (
    <>
      {/* Dashboard content with dark mode support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Patients</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,234</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">89</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Currently ongoing</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$12,345</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This month</p>
        </div>
      </div>
      </>
  )
}

export default Home