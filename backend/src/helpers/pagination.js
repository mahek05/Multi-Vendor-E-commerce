
/***
 * Get pagination metadata
 */
exports.getPaginationMetadata = (pageNo = 1, limitNo = 10) => {
    const page = parseInt(pageNo) || 1;
    const limit = parseInt(limitNo) || 10;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

/***
 * Get paginated response
 */
exports.getPaginatedResponse = (data, page, limit) => {
    return {
        page_data: data.rows,
        page_information: {
            total_data: data.count,
            last_page: Math.ceil(data.count / limit),
            current_page: page,
            previous_page: page > 1 ? page - 1 : 0,
            next_page: page < Math.ceil(data.count / limit) ? page + 1 : 0
        }
    }
};