import CustomError from "./CustomError.js";

class ModelQuery {
    constructor(queryObj, queryParamObj, counts) {
        this._queryObj = queryObj;
        this._queryParamObj = queryParamObj;
        this._counts = counts;
        this._page = parseInt(queryParamObj.page) || 1;
        this._limit = parseInt(queryParamObj.limit) || 8;
    }

    // Optional full-text search
    search() {
        if (this._queryParamObj.search) {
            const searchQuery = new RegExp(this._queryParamObj.search, "i");
            this._queryObj = this._queryObj.find({ $text: { $search: searchQuery } });
        }
        return this;
    }

    // Paginate results
    paginate(next) {
        const skip = (this._page - 1) * this._limit;

        // Prevent throwing on page 1 when data is empty
        if (skip >= this._counts && this._counts !== 0) {
            const message = `Page ${this._page} does not exist.`;
            const err = new CustomError(message, 404);
            return next(err);
        }

        this._queryObj = this._queryObj.skip(skip).limit(this._limit);
        return this;
    }

    // Return pagination metadata
    getPaginationMeta() {
        const totalPages = Math.ceil(this._counts / this._limit);
        return {
            page: this._page,
            limit: this._limit,
            totalPages,
        };
    }
}

export default ModelQuery;
