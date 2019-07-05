const { forwardTo } = require('prisma-binding')
const Query = {
    users: forwardTo('db'),
    projects: forwardTo('db'),

    user(parent, args, ctx, info) {
        console.log('💣 ctx.request.userId = ', ctx.request.userId)
        console.log('🔥 info = ', info)
        // check if there is a current user ID
        if (!ctx.request.userId) {
            return null
        }
        return ctx.db.query.user(
            {
                where: { id: ctx.request.userId },
            },
            info
        )
    },
}
module.exports = Query
