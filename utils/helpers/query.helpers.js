import ModelQuery from "../../modules/ModelQuery.js";

// Run a paginated Mongoose .find() query with optional search and population

export const runPaginatedQuery = async ({
    model,
    filter = {},
    req,
    next,
    populate = [],
    sort = { createdAt: -1 }, // ← ADD DEFAULT sort
}) => {
    const counts = await model.countDocuments(filter);

    if (counts === 0) {
        return { posts: [], page: 1, totalPages: 0 };
    }

    let queryBuilder = new ModelQuery(model.find(filter).sort(sort), req.query, counts)
        .search()
        .paginate(next);

    let query = queryBuilder._queryObj;

    for (const pop of populate) {
        query = query.populate(pop);
    }

    const posts = await query;
    const { page, totalPages } = queryBuilder.getPaginationMeta();

    return { posts, page, totalPages };
};

/**
 * Run a paginated aggregation pipeline
 * Useful for user suggestions, followers, etc.
 */
export const runPaginatedAggregate = async ({
    model,
    pipeline = [],
    req,
    limit = 8,
}) => {
    const page = parseInt(req.query.pageNo) || 1;
    const skip = (page - 1) * limit;

    // Count stage
    const totalPipeline = [...pipeline, { $count: "total" }];
    const [{ total } = { total: 0 }] = await model.aggregate(totalPipeline);

    if (total === 0) {
        return { users: [], page: 1, totalPages: 0 };
    }

    const paginatedPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
    const results = await model.aggregate(paginatedPipeline);
    const totalPages = Math.ceil(total / limit);

    return { users: results, page, totalPages };
};
