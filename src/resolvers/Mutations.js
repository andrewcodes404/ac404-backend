const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Mutations = {
    // async createUser(parent, args, ctx, info) {
    //     const user = await ctx.db.mutation.createUser(
    //         {
    //             data: {
    //                 ...args,
    //             },
    //         },
    //         info
    //     )

    //     // console.log('mutation 🏃‍ args', args)
    //     return user
    // },

    /// this mutation is async/await WHY? using this method gives us options to console log if we get an error, for no async/await see the next mutations
    async createProject(parent, args, ctx, info) {
        // TODO: Check if they are logged in
        const project = await ctx.db.mutation.createProject(
            {
                data: {
                    ...args,
                },
            },
            info
        )
        // console.log('mutation createProject 🏃‍', args)
        return project
    },
    async signup(parent, args, ctx, info) {
        // 2. lowercase their email to prevent accidents
        args.email = args.email.toLowerCase()
        // 3. hash their password             SALT LENGTH 👇
        const password = await bcrypt.hash(args.password, 10)
        // 4. create the user in the database
        const user = await ctx.db.mutation.createUser(
            {
                data: {
                    ...args,
                    password,
                    permissions: { set: ['USER'] },
                },
            },
            info
        )
        // 5. create the JWT token for them
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

        // 6. We place the jwt as a cookie in the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
        })

        // 7. Finalllllly we return the user to the browser
        return user
    },

    async login(parent, { email, password }, ctx, info) {
        // 1. check if there is a user with that email
        const user = await ctx.db.query.user({ where: { email } })
        if (!user) {
            throw new Error(`No such user found for email ${email}`)
        }
        // 2. Check if their password is correct
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            throw new Error('Invalid Password!')
        }
        // 3. generate the JWT Token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
        // 4. Set the cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        })
        // 5. Return the user
        return user
    },
    logout(parent, args, ctx, info) {
        ctx.response.clearCookie('token')
        return { message: 'Goodbye!' }
    },
}

module.exports = Mutations
