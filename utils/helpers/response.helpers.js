export const sendPostResponse = (
    res,
    statusCode,
    post,
    posts,
    message,
    page = undefined,
    totalPages = undefined
) => {
    res.status(statusCode).json({
        data: {
            status: true,
            post,
            posts,
            message,
            page,
            totalPages,
        },
    });
};

export const sendUserResponse = (
    res,
    statusCode,
    user,
    users,
    message,
    page = undefined,
    totalPages = undefined
) => {
    res.status(statusCode).json({
        data: {
            status: true,
            user,
            users,
            message,
            page,
            totalPages,
        },
    });
};
