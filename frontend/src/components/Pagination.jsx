const Pagination = ({ pageInfo, onPageChange }) => {
    if (!pageInfo || pageInfo.last_page <= 1) return null;

    const {
        current_page,
        last_page,
        previous_page,
        next_page
    } = pageInfo;

    return (
        <nav
            aria-label="Page navigation"
            className="mt-10 flex justify-center"
        >
            <ul className="flex -space-x-px text-sm">

                {/* Previous */}
                <li>
                    <button
                        disabled={!previous_page}
                        onClick={() => onPageChange(previous_page)}
                        className={`flex items-center justify-center px-3 h-10 border font-medium rounded-s
              ${previous_page
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Previous
                    </button>
                </li>

                {/* Page Numbers */}
                {Array.from({ length: last_page }, (_, i) => i + 1).map((page) => (
                    <li key={page}>
                        <button
                            onClick={() => onPageChange(page)}
                            aria-current={page === current_page ? "page" : undefined}
                            className={`flex items-center justify-center w-10 h-10 border font-medium
                ${page === current_page
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {page}
                        </button>
                    </li>
                ))}

                {/* Next */}
                <li>
                    <button
                        disabled={!next_page}
                        onClick={() => onPageChange(next_page)}
                        className={`flex items-center justify-center px-3 h-10 border font-medium rounded-e
              ${next_page
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Next
                    </button>
                </li>

            </ul>
        </nav>
    );
};

export default Pagination;
