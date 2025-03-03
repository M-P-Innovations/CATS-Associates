module.exports = {
    content: [
      './src/**/*.{html,js,jsx,ts,tsx}', // Ensure this is included
    ],
    safelist: [
      'bg-gray-100', 'bg-orange-100', 'bg-green-100', 'bg-teal-100', 'bg-blue-100', 'bg-red-100', 'bg-amber-100',
      'dark:bg-gray-300', 'dark:bg-orange-300', 'dark:bg-green-300', 'dark:bg-teal-300', 'dark:bg-blue-300', 'dark:bg-red-300','dark:bg-amber-300',
      'text-gray-500', 'text-orange-500', 'text-green-500', 'text-teal-500', 'text-blue-500', 'text-red-500','text-amber-500',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };